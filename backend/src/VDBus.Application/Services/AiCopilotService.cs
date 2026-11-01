using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VDBus.Application.Common.Interfaces;
using VDBus.Application.DTOs.Copilot;
using VDBus.Domain.Enums;

namespace VDBus.Application.Services;

public class AiCopilotService : IAiCopilotService
{
    private readonly IApplicationDbContext _context;

    public AiCopilotService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CopilotQueryResponseDto> AskCopilotAsync(CopilotQueryRequestDto request, CancellationToken ct = default)
    {
        string q = (request.Question ?? string.Empty).ToLowerInvariant().Trim();
        var sources = new List<string>();
        int recordCount = 0;
        var sb = new StringBuilder();

        // 1. Phân tích ý định: Nhiên liệu / Xăng dầu
        if (q.Contains("nhiên liệu") || q.Contains("xăng dầu") || q.Contains("dầu") || q.Contains("tiêu hao"))
        {
            sources.Add("FuelRecords");
            sources.Add("Vehicles");

            var fuelRecords = await _context.FuelRecords
                .Include(f => f.Vehicle)
                .OrderByDescending(f => f.PurchasedAtUtc)
                .Take(20)
                .ToListAsync(ct);

            recordCount = fuelRecords.Count;
            decimal totalLitre = fuelRecords.Sum(f => f.FuelLitre);
            decimal totalCost = fuelRecords.Sum(f => f.TotalAmountVnd);
            var abnormalEvents = fuelRecords.Where(f => f.AbnormalityScore >= 0.50).ToList();

            sb.AppendLine("### Phân tích Tình hình Tiêu thụ Nhiên liệu Đội xe");
            sb.AppendLine();
            sb.AppendLine($"- **Tổng lượng dầu đã nạp**: {totalLitre:N1} Lít");
            sb.AppendLine($"- **Tổng chi phí nhiên liệu**: {totalCost:N0} VND");
            sb.AppendLine($"- **Số phiếu đổ dầu ghi nhận**: {fuelRecords.Count} lượt");
            sb.AppendLine($"- **Số sự kiện chênh lệch đáng lưu ý**: {abnormalEvents.Count} sự kiện");
            sb.AppendLine();

            if (abnormalEvents.Count > 0)
            {
                sb.AppendLine("#### Danh sách Phương tiện có Mức tiêu hao hoặc Nạp dầu Cần lưu ý:");
                sb.AppendLine("| Biển số xe | Lượng dầu | Chi phí (VND) | Điểm chênh lệch | Ghi chú đánh giá |");
                sb.AppendLine("|---|---|---|---|---|");
                foreach (var ab in abnormalEvents)
                {
                    sb.AppendLine($"| {ab.Vehicle?.LicensePlate ?? "Chưa rõ"} | {ab.FuelLitre:N1} L | {ab.TotalAmountVnd:N0} | {ab.AbnormalityScore:F2} | {ab.AbnormalityReason} |");
                }
                sb.AppendLine();
                sb.AppendLine("> *Khuyến nghị*: Điểm chênh lệch được đo lường tự động từ cảm biến dầu và đối chiếu định mức; cần kiểm tra van bình dầu và tải trọng thực tế.");
            }
            else
            {
                sb.AppendLine("Toàn bộ các phiếu nạp dầu gần nhất đều nằm trong biên độ dung sai cho phép của cảm biến bình dầu và định mức xe.");
            }
        }
        // 2. Phân tích ý định: Doanh thu / Lợi nhuận / P&L
        else if (q.Contains("doanh thu") || q.Contains("lợi nhuận") || q.Contains("p&l") || q.Contains("tiền") || q.Contains("tài chính"))
        {
            sources.Add("Invoices");
            sources.Add("Orders");
            sources.Add("Trips");

            var orders = await _context.Orders.ToListAsync(ct);
            var invoices = await _context.Invoices.Include(i => i.Customer).ToListAsync(ct);
            recordCount = orders.Count + invoices.Count;

            decimal totalFreight = orders.Sum(o => o.FreightAmountVnd);
            decimal totalInvoiced = invoices.Sum(i => i.TotalAmountVnd);
            decimal totalPaid = invoices.Where(i => i.Status == PaymentStatus.Paid).Sum(i => i.TotalAmountVnd);
            decimal totalPending = invoices.Where(i => i.Status == PaymentStatus.Pending).Sum(i => i.TotalAmountVnd);

            sb.AppendLine("### Báo cáo Doanh thu & Dòng tiền Vận tải");
            sb.AppendLine();
            sb.AppendLine($"- **Tổng cước vận tải phát sinh**: {totalFreight:N0} VND ({orders.Count} đơn hàng)");
            sb.AppendLine($"- **Tổng hóa đơn cước đã xuất**: {totalInvoiced:N0} VND ({invoices.Count} hóa đơn)");
            sb.AppendLine($"- **Đã thanh toán (Thực thu)**: {totalPaid:N0} VND");
            sb.AppendLine($"- **Công nợ cước đang chờ thu**: {totalPending:N0} VND");
            sb.AppendLine();

            sb.AppendLine("#### Bóc tách Doanh thu theo Khách hàng Chính:");
            sb.AppendLine("| Mã KH | Tên khách hàng | Số đơn hàng | Tổng doanh thu (VND) |");
            sb.AppendLine("|---|---|---|---|");

            var custGroup = invoices
                .GroupBy(i => i.Customer?.Name ?? "Khách lẻ")
                .Select(g => new { Name = g.Key, InvoicesCount = g.Count(), Total = g.Sum(x => x.TotalAmountVnd) })
                .OrderByDescending(x => x.Total)
                .Take(5);

            foreach (var cg in custGroup)
            {
                sb.AppendLine($"| KH | {cg.Name} | {cg.InvoicesCount} HĐ | {cg.Total:N0} VND |");
            }
        }
        // 3. Phân tích ý định: Đội xe / Phương tiện
        else if (q.Contains("xe") || q.Contains("phương tiện") || q.Contains("đội xe") || q.Contains("tải trọng"))
        {
            sources.Add("Vehicles");
            sources.Add("Trips");

            var vehicles = await _context.Vehicles.ToListAsync(ct);
            recordCount = vehicles.Count;

            int available = vehicles.Count(v => v.Status == "Available");
            int onTrip = vehicles.Count(v => v.Status == "OnTrip");
            int maintenance = vehicles.Count(v => v.Status == "Maintenance");

            sb.AppendLine("### Trạng thái Vận hành Đội xe Doanh nghiệp");
            sb.AppendLine();
            sb.AppendLine($"- **Tổng số lượng phương tiện**: {vehicles.Count} xe");
            sb.AppendLine($"- **Đang trên chuyến vận chuyển**: {onTrip} xe");
            sb.AppendLine($"- **Sẵn sàng điều phối**: {available} xe");
            sb.AppendLine($"- **Đang dừng bảo dưỡng / sửa chữa**: {maintenance} xe");
            sb.AppendLine();

            sb.AppendLine("#### Danh sách Phương tiện Sẵn sàng Điều phối:");
            sb.AppendLine("| Biển số | Dòng xe | Tải trọng (tấn) | Thể tích (m3) | Trạng thái |");
            sb.AppendLine("|---|---|---|---|---|");
            foreach (var v in vehicles.Take(6))
            {
                sb.AppendLine($"| {v.LicensePlate} | {v.MakeModel} | {(v.MaxPayloadKg / 1000m):F1} | {v.CargoVolumeCbm:F1} | {v.Status} |");
            }
        }
        // 4. Tổng quan / Câu hỏi mặc định
        else
        {
            sources.Add("Tenants");
            sources.Add("Vehicles");
            sources.Add("Orders");
            sources.Add("Trips");

            int vehicleCount = await _context.Vehicles.CountAsync(ct);
            int orderCount = await _context.Orders.CountAsync(ct);
            int tripCount = await _context.Trips.CountAsync(ct);
            recordCount = vehicleCount + orderCount + tripCount;

            sb.AppendLine("### Tổng quan Hoạt động Vận hành Logistics");
            sb.AppendLine();
            sb.AppendLine("Trợ lý phân tích dữ liệu VDBus Copilot sẵn sàng trả lời các câu hỏi về:");
            sb.AppendLine("- Tình hình tiêu hao và bất thường nhiên liệu đội xe");
            sb.AppendLine("- Doanh thu, công nợ khách hàng và báo cáo P&L chuyến xe");
            sb.AppendLine("- Tình trạng sẵn sàng điều phối của phương tiện và cảnh báo quá hạn đăng kiểm");
            sb.AppendLine();
            sb.AppendLine($"*Dữ liệu hiện hành của Tenant ghi nhận {vehicleCount} phương tiện, {orderCount} đơn hàng và {tripCount} chuyến xe.*");
        }

        sb.AppendLine();
        sb.AppendLine("---");
        sb.AppendLine($"*Trích nguồn dữ liệu thực tế: {string.Join(", ", sources.Select(s => $"`{s}`"))} | Thời điểm trích xuất: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC (Chế độ phân tích chỉ đọc)*");

        return new CopilotQueryResponseDto
        {
            Question = request.Question ?? string.Empty,
            AnswerMarkdown = sb.ToString(),
            DataSourcesCited = sources,
            ReferencedRecordsCount = recordCount,
            CalculatedAtUtc = DateTime.UtcNow,
            IsReadOnly = true
        };
    }
}
