import React, { useState } from 'react';
import {
  PageHeader,
  Button,
  Badge,
  MockDataBadge,
  Input,
  Banner,
} from '@vdbus/design-system';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  content: string;
  sources?: string[];
  recordsCount?: number;
  timestamp: string;
}

export const SubscriptionsCopilotPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'copilot' | 'subscriptions'>('copilot');
  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'copilot',
      content: 'Chào bạn, tôi là VDBus AI Copilot - Trợ lý phân tích dữ liệu vận hành thời gian thực. Tôi có thể giải đáp các câu hỏi phân tích về P&L chuyến xe, bất thường xăng dầu, hạn đăng kiểm và hiệu suất tài xế dựa trên cơ sở dữ liệu hiện hành.',
      timestamp: '14:00',
    },
  ]);

  const sampleQuestions = [
    'Xe nào trong đội xe có mức tiêu hao nhiên liệu bất thường nhất tháng này?',
    'So sánh doanh thu và lợi nhuận giữa tuyến Đà Nẵng - Chu Lai và Hà Nội - Vinh',
    'Có những xe nào sắp hết hạn đăng kiểm trong 15 ngày tới?',
    'Khách hàng nào đóng góp tỷ trọng lợi nhuận gộp cao nhất quý này?',
  ];

  const handleSendQuestion = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: questionText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    let replyContent = '';
    let sourcesCited: string[] = [];
    let recordsCount = 0;

    const qLower = questionText.toLowerCase();

    if (qLower.includes('nhiên liệu') || qLower.includes('xăng') || qLower.includes('dầu')) {
      replyContent = `Phân tích dữ liệu nhiên liệu ghi nhận:
- Phương tiện có độ lệch tiêu hao cao nhất: **43H-012.88** (Isuzu GIGA 6x2)
- Mức tiêu hao thực tế: **28.5 L/100km** (Định mức tiêu chuẩn: 24.0 L/100km, chênh lệch +18.75%)
- Điểm bất thường (Abnormality Score): **0.65 / 1.0** (Mức cần rà soát)
- Dữ liệu phao dầu ghi nhận lượng nạp thực tế vào bình thấp hơn 12 lít so với số ghi trên phiếu đổ xăng dầu tại PVOIL Cửa hàng 05.`;
      sourcesCited = ['FuelRecords', 'TelematicsPositions', 'Vehicles'];
      recordsCount = 38;
    } else if (qLower.includes('tuyến') || qLower.includes('chu lai') || qLower.includes('vinh')) {
      replyContent = `So sánh hiệu quả khai thác 2 tuyến vận tải trong kỳ:
1. **Tuyến Đà Nẵng → Quảng Nam (KCN Chu Lai)**:
   - Số chuyến hoàn thành: 28 chuyến | Cự ly TB: 95 km
   - Tổng Doanh thu: 154.000.000 đ | Chi phí trực tiếp: 98.000.000 đ
   - Lợi nhuận gộp: **56.000.000 đ** | Biên lợi nhuận: **36.4%**
2. **Tuyến Hà Nội → Nghệ An (TP. Vinh)**:
   - Số chuyến hoàn thành: 26 chuyến | Cự ly TB: 310 km
   - Tổng Doanh thu: 167.500.000 đ | Chi phí trực tiếp: 121.400.000 đ
   - Lợi nhuận gộp: **46.100.000 đ** | Biên lợi nhuận: **27.5%**

*Đánh giá:* Tuyến Chu Lai có tỷ suất lợi nhuận trên chi phí tối ưu hơn (+8.9%) nhờ tối ưu hóa phí cầu đường VETC và thời gian quay vòng xe trong ngày.`;
      sourcesCited = ['Trips', 'Orders', 'FuelRecords', 'TollTransactions'];
      recordsCount = 54;
    } else if (qLower.includes('đăng kiểm') || qLower.includes('hạn') || qLower.includes('hồ sơ')) {
      replyContent = `Cảnh báo hạn kiểm định & chứng từ phương tiện:
- **Xe 50H-918.44**: Giấy chứng nhận Kiểm định ATKT & BVMT đã **quá hạn 17 ngày** (Hết hạn ngày 15/10/2026). Xe đang bị hệ thống tự động khóa khỏi điều phối chuyến mới.
- **Xe 43C-189.24**: Giấy chứng nhận Kiểm định sẽ **hết hạn trong 9 ngày** (10/11/2026). Cần sắp xếp đưa xe vào trung tâm đăng kiểm trong tuần này.`;
      sourcesCited = ['VehicleDocuments', 'Vehicles'];
      recordsCount = 12;
    } else {
      replyContent = `Phân tích đóng góp lợi nhuận theo danh mục khách hàng:
- **Masan Consumer Miền Trung**: Doanh thu 198.000.000 đ, Lợi nhuận gộp **66.000.000 đ** (Biên lãi: 33.3%, đóng góp 40.7% tổng lợi nhuận gộp).
- **Vinamilk Logistics Da Nang**: Doanh thu 165.000.000 đ, Lợi nhuận gộp **56.000.000 đ** (Biên lãi: 33.9%, đóng góp 34.5% tổng lợi nhuận gộp).
- **Acecook Việt Nam Chi nhánh Đà Nẵng**: Doanh thu 140.500.000 đ, Lợi nhuận gộp **40.100.000 đ** (Biên lãi: 28.5%, đóng góp 24.8% tổng lợi nhuận gộp).`;
      sourcesCited = ['Invoices', 'Customers', 'Orders', 'Trips'];
      recordsCount = 78;
    }

    const copilotMsg: ChatMessage = {
      id: `copilot-${Date.now()}`,
      sender: 'copilot',
      content: replyContent,
      sources: sourcesCited,
      recordsCount: recordsCount,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg, copilotMsg]);
    setInputQuestion('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
      <PageHeader
        title="Trợ lý AI Copilot & Thuê bao Doanh nghiệp"
        subtitle="Hệ thống hỏi đáp dữ liệu điều phối và kiểm soát hạn mức định mức tài nguyên thuê bao (Multi-tenant Metering)"
        actions={
          <div style={{ display: 'flex', gap: 'var(--vdbus-space-2)', alignItems: 'center' }}>
            <MockDataBadge />
            <Badge variant="info">Gói Enterprise</Badge>
          </div>
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--vdbus-space-2)', borderBottom: '1px solid var(--vdbus-color-border-subtle)', paddingBottom: 'var(--vdbus-space-2)' }}>
        <button
          onClick={() => setActiveTab('copilot')}
          style={{
            padding: 'var(--vdbus-space-2) var(--vdbus-space-4)',
            borderRadius: 'var(--vdbus-radius-base)',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'copilot' ? 'var(--vdbus-color-primary)' : 'transparent',
            color: activeTab === 'copilot' ? 'var(--vdbus-color-bg-canvas)' : 'var(--vdbus-color-text-secondary)',
            fontWeight: 600,
            fontSize: 'var(--vdbus-font-size-sm)',
          }}
        >
          Trợ lý VDBus AI Copilot
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          style={{
            padding: 'var(--vdbus-space-2) var(--vdbus-space-4)',
            borderRadius: 'var(--vdbus-radius-base)',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'subscriptions' ? 'var(--vdbus-color-primary)' : 'transparent',
            color: activeTab === 'subscriptions' ? 'var(--vdbus-color-bg-canvas)' : 'var(--vdbus-color-text-secondary)',
            fontWeight: 600,
            fontSize: 'var(--vdbus-font-size-sm)',
          }}
        >
          Định mức Thuê bao & Quota
        </button>
      </div>

      {activeTab === 'copilot' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-3)' }}>
          {/* Suggested Quick Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-2)' }}>
            <span style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)', fontWeight: 600 }}>
              Câu hỏi phân tích đề xuất:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--vdbus-space-2)' }}>
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuestion(q)}
                  style={{
                    padding: 'var(--vdbus-space-2) var(--vdbus-space-3)',
                    backgroundColor: 'var(--vdbus-color-bg-subtle)',
                    border: '1px solid var(--vdbus-color-border-subtle)',
                    borderRadius: 'var(--vdbus-radius-md)',
                    fontSize: 'var(--vdbus-font-size-xs)',
                    color: 'var(--vdbus-color-text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div
            style={{
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              border: '1px solid var(--vdbus-color-border-subtle)',
              borderRadius: 'var(--vdbus-radius-base)',
              padding: 'var(--vdbus-space-4)',
              minHeight: '380px',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--vdbus-space-3)',
              overflowY: 'auto',
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: msg.sender === 'user' ? 'var(--vdbus-color-primary)' : 'var(--vdbus-color-bg-subtle)',
                  color: msg.sender === 'user' ? 'var(--vdbus-color-bg-canvas)' : 'var(--vdbus-color-text-primary)',
                  borderRadius: 'var(--vdbus-radius-base)',
                  padding: 'var(--vdbus-space-3) var(--vdbus-space-4)',
                  fontSize: 'var(--vdbus-font-size-sm)',
                  lineHeight: '1.6',
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                {msg.sources && msg.sources.length > 0 && (
                  <div
                    style={{
                      marginTop: 'var(--vdbus-space-2)',
                      paddingTop: 'var(--vdbus-space-2)',
                      borderTop: '1px solid var(--vdbus-color-border-subtle)',
                      fontSize: 'var(--vdbus-font-size-xs)',
                      color: 'var(--vdbus-color-text-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--vdbus-space-1)',
                    }}
                  >
                    <div>
                      <strong>Trích dẫn nguồn dữ liệu ({msg.recordsCount} bản ghi):</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--vdbus-space-1)', flexWrap: 'wrap' }}>
                      {msg.sources.map(src => (
                        <span
                          key={src}
                          style={{
                            padding: '2px 6px',
                            backgroundColor: 'var(--vdbus-color-bg-surface)',
                            borderRadius: 'var(--vdbus-radius-sm)',
                            border: '1px solid var(--vdbus-color-border-subtle)',
                          }}
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    fontSize: 'var(--vdbus-font-size-xs)',
                    opacity: 0.7,
                    marginTop: 'var(--vdbus-space-1)',
                    textAlign: 'right',
                  }}
                >
                  {msg.timestamp}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div style={{ display: 'flex', gap: 'var(--vdbus-space-2)' }}>
            <div style={{ flex: 1 }}>
              <Input
                placeholder="Nhập câu hỏi phân tích dữ liệu (vd: Tổng doanh thu tuần trước là bao nhiêu?)..."
                value={inputQuestion}
                onChange={e => setInputQuestion(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={() => handleSendQuestion(inputQuestion)}>
              Gửi câu hỏi
            </Button>
          </div>

          <Banner variant="info" title="Nguyên tắc an toàn dữ liệu VDBus Copilot">
            Copilot hoạt động ở chế độ <strong>chỉ đọc (Read-Only)</strong> và luôn trích dẫn bảng dữ liệu nguồn cụ thể để người vận hành kiểm chứng. Không tự ý sửa đổi trạng thái đơn hàng hoặc dữ liệu tài chính.
          </Banner>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
          {/* Current Tier Quota Usage Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--vdbus-space-3)',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                border: '1px solid var(--vdbus-color-border-subtle)',
                borderRadius: 'var(--vdbus-radius-base)',
                padding: 'var(--vdbus-space-4)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)', marginBottom: 'var(--vdbus-space-1)' }}>
                Phương tiện kết nối
              </div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 700, color: 'var(--vdbus-color-text-primary)' }}>
                48 / 100 xe
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--vdbus-color-bg-subtle)', borderRadius: '3px', marginTop: 'var(--vdbus-space-2)', overflow: 'hidden' }}>
                <div style={{ width: '48%', height: '100%', backgroundColor: 'var(--vdbus-color-primary)' }} />
              </div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)', marginTop: 'var(--vdbus-space-1)' }}>
                Đã sử dụng 48% quota xe
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                border: '1px solid var(--vdbus-color-border-subtle)',
                borderRadius: 'var(--vdbus-radius-base)',
                padding: 'var(--vdbus-space-4)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)', marginBottom: 'var(--vdbus-space-1)' }}>
                Đơn hàng trong tháng
              </div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 700, color: 'var(--vdbus-color-text-primary)' }}>
                420 / 2.000 đơn
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--vdbus-color-bg-subtle)', borderRadius: '3px', marginTop: 'var(--vdbus-space-2)', overflow: 'hidden' }}>
                <div style={{ width: '21%', height: '100%', backgroundColor: 'var(--vdbus-color-primary)' }} />
              </div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)', marginTop: 'var(--vdbus-space-1)' }}>
                Đã sử dụng 21% quota đơn
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                border: '1px solid var(--vdbus-color-border-subtle)',
                borderRadius: 'var(--vdbus-radius-base)',
                padding: 'var(--vdbus-space-4)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)', marginBottom: 'var(--vdbus-space-1)' }}>
                Bản ghi Telematics IoT
              </div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 700, color: 'var(--vdbus-color-text-primary)' }}>
                840K / 2.000K pings
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--vdbus-color-bg-subtle)', borderRadius: '3px', marginTop: 'var(--vdbus-space-2)', overflow: 'hidden' }}>
                <div style={{ width: '42%', height: '100%', backgroundColor: 'var(--vdbus-color-primary)' }} />
              </div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)', marginTop: 'var(--vdbus-space-1)' }}>
                Đã sử dụng 42% quota IoT
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                border: '1px solid var(--vdbus-color-border-subtle)',
                borderRadius: 'var(--vdbus-radius-base)',
                padding: 'var(--vdbus-space-4)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)', marginBottom: 'var(--vdbus-space-1)' }}>
                Dung lượng lưu trữ ePOD
              </div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 700, color: 'var(--vdbus-color-text-primary)' }}>
                14.2 / 50 GB
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--vdbus-color-bg-subtle)', borderRadius: '3px', marginTop: 'var(--vdbus-space-2)', overflow: 'hidden' }}>
                <div style={{ width: '28.4%', height: '100%', backgroundColor: 'var(--vdbus-color-primary)' }} />
              </div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)', marginTop: 'var(--vdbus-space-1)' }}>
                Đã sử dụng 28.4% dung lượng
              </div>
            </div>
          </div>

          {/* Pricing Plans Comparison */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--vdbus-space-4)',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                border: '1px solid var(--vdbus-color-border-subtle)',
                borderRadius: 'var(--vdbus-radius-base)',
                padding: 'var(--vdbus-space-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--vdbus-space-3)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 'var(--vdbus-font-size-md)' }}>Gói Khởi Nghiệp (Starter)</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 700 }}>Miễn phí</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)' }}>Dành cho nhà xe cá thể quy mô dưới 5 xe</div>
              <ul style={{ fontSize: 'var(--vdbus-font-size-xs)', paddingLeft: 'var(--vdbus-space-4)', margin: 0, color: 'var(--vdbus-color-text-secondary)' }}>
                <li>Tối đa 5 xe</li>
                <li>Tối đa 100 đơn hàng / tháng</li>
                <li>Telematics GPS cơ bản</li>
                <li>5 GB lưu trữ ảnh ePOD</li>
              </ul>
              <Button variant="secondary">Gói hiện tại</Button>
            </div>

            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                border: '1px solid var(--vdbus-color-border-subtle)',
                borderRadius: 'var(--vdbus-radius-base)',
                padding: 'var(--vdbus-space-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--vdbus-space-3)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 'var(--vdbus-font-size-md)' }}>Gói Chuyên Nghiệp (Pro)</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 700 }}>2.900.000 đ <span style={{ fontSize: 'var(--vdbus-font-size-xs)', fontWeight: 400 }}>/ tháng</span></div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)' }}>Dành cho doanh nghiệp vừa từ 5 đến 30 xe</div>
              <ul style={{ fontSize: 'var(--vdbus-font-size-xs)', paddingLeft: 'var(--vdbus-space-4)', margin: 0, color: 'var(--vdbus-color-text-secondary)' }}>
                <li>Tối đa 30 xe</li>
                <li>Tối đa 1.000 đơn hàng / tháng</li>
                <li>Giám sát chuỗi lạnh & cảm biến phao dầu</li>
                <li>Đối soát tự động BOT VETC</li>
              </ul>
              <Button variant="secondary">Nâng cấp gói Pro</Button>
            </div>

            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                border: '2px solid var(--vdbus-color-primary)',
                borderRadius: 'var(--vdbus-radius-base)',
                padding: 'var(--vdbus-space-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--vdbus-space-3)',
                position: 'relative',
              }}
            >
              <div style={{ position: 'absolute', top: '-10px', right: '16px' }}>
                <Badge variant="info">Đang kích hoạt</Badge>
              </div>
              <div style={{ fontWeight: 700, fontSize: 'var(--vdbus-font-size-md)' }}>Gói Doanh Nghiệp (Enterprise)</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 700, color: 'var(--vdbus-color-primary)' }}>8.900.000 đ <span style={{ fontSize: 'var(--vdbus-font-size-xs)', fontWeight: 400 }}>/ tháng</span></div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)' }}>Đầy đủ tính năng P&L, HĐĐT, AI Copilot, Tải trục</div>
              <ul style={{ fontSize: 'var(--vdbus-font-size-xs)', paddingLeft: 'var(--vdbus-space-4)', margin: 0, color: 'var(--vdbus-color-text-secondary)' }}>
                <li>Tối đa 100 xe</li>
                <li>Tối đa 5.000 đơn hàng / tháng</li>
                <li>Tích hợp xuất hóa đơn điện tử VAT CQT</li>
                <li>Cổng thanh toán VietQR ngân hàng NAPAS</li>
                <li>Trợ lý AI Copilot phân tích dữ liệu</li>
              </ul>
              <Button variant="primary">Gia hạn thuê bao</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
