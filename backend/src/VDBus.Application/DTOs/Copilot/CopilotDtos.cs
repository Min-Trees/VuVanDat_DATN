using System;
using System.Collections.Generic;

namespace VDBus.Application.DTOs.Copilot;

public class CopilotQueryRequestDto
{
    public string Question { get; set; } = string.Empty;
}

public class CopilotQueryResponseDto
{
    public string Question { get; set; } = string.Empty;
    public string AnswerMarkdown { get; set; } = string.Empty;
    public List<string> DataSourcesCited { get; set; } = new();
    public int ReferencedRecordsCount { get; set; }
    public DateTime CalculatedAtUtc { get; set; } = DateTime.UtcNow;
    public bool IsReadOnly { get; set; } = true;
}
