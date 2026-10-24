using System;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

public class Tenant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty; // Mã định danh rút gọn (e.g. VDBUS-VN)
    public string TaxCode { get; set; } = string.Empty; // Mã số thuế doanh nghiệp
    public string Plan { get; set; } = "Standard";
    public bool IsActive { get; set; } = true;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
}
