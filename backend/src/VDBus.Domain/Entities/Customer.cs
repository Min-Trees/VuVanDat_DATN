using System;
using System.Collections.Generic;
using VDBus.Domain.Common;

namespace VDBus.Domain.Entities;

public class Customer : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty; // Mã khách hàng (KH-001)
    public string TaxCode { get; set; } = string.Empty; // Mã số thuế
    public string ContactPerson { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal CreditLimitVnd { get; set; } = 50000000; // Hạn mức công nợ (mặc định 50tr)
    public int PaymentTermDays { get; set; } = 30; // Kỳ hạn thanh toán (ngày)
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}
