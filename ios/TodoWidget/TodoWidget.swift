import WidgetKit
import SwiftUI

struct TodoEntry: TimelineEntry {
    let date: Date
    let activeTimerCount: Int
    let nextTimer: String?
}

struct TodoWidgetView: View {
    var entry: TodoEntry

    var body: some View {
        ZStack {

            VStack(alignment: .leading, spacing: 0) {
                // 상단 텍스트 + 재생 버튼
                HStack {
                    Text("타이머 바로가기!")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.black)

                  
                   
                }

                Spacer()

              HStack(alignment: .bottom) {
                  // 캐릭터 이미지 (좌측 하단 고정)
                  Image("Monji")
                      .frame(width: 54, height: 44)
                      .alignmentGuide(.bottom) { d in d[.bottom] } // 하단 정렬 확정
              
                Spacer()
                
                VStack(alignment: .trailing, spacing: 7) {
                    Image(systemName: "play.circle.fill")
                      .foregroundColor(.black)
                        .font(.system(size: 20))
                    
                    
                    Text("시작")
                        .font(.system(size: 25, weight: .bold))
                        .foregroundColor(.black)
                       
              


                      HStack(spacing: 3) {
                          Circle().fill(Color.black).frame(width: 4, height: 4)
                          Circle().fill(Color.black).frame(width: 4, height: 4)
                          Circle().fill(Color.black).frame(width: 4, height: 4)
                      }
                  }
              }
              .frame(maxHeight: .infinity, alignment: .bottom) // 핵심!

            }
        }
      // iOS 17 이상에서 배경색 명시적으로 설정
      .containerBackground(Color(hex: "#FFF8A6"), for: .widget)

        // 딥링크
        .widgetURL(URL(string: "monji_timer://todo?autoAdd=true"))
      
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: .alphanumerics.inverted)
        var int = UInt64()
        Scanner(string: hex).scanHexInt64(&int)

        let r, g, b: UInt64
        switch hex.count {
        case 6:
            (r, g, b) = ((int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff)
        default:
            (r, g, b) = (1, 1, 1)
        }

        self.init(.sRGB,
                  red: Double(r) / 255,
                  green: Double(g) / 255,
                  blue: Double(b) / 255,
                  opacity: 1)
    }
}

struct TodoProvider: TimelineProvider {
    func placeholder(in context: Context) -> TodoEntry {
        TodoEntry(date: Date(), activeTimerCount: 2, nextTimer: "집중 시간")
    }

    func getSnapshot(in context: Context, completion: @escaping (TodoEntry) -> ()) {
        let entry = TodoEntry(date: Date(), activeTimerCount: 2, nextTimer: "집중 시간")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TodoEntry>) -> ()) {
        let entry = TodoEntry(date: Date(), activeTimerCount: 3, nextTimer: "집중 시간")
        let nextUpdateDate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdateDate))
        completion(timeline)
    }
}

struct TodoWidget: Widget {
    let kind: String = "TodoWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TodoProvider()) { entry in
            TodoWidgetView(entry: entry)
        }
        .configurationDisplayName("타이머")
        .description("홈 화면에서 바로 타이머를 시작할 수 있어요")
        .supportedFamilies([.systemSmall])
    }
}


struct TodoWidgetView_Previews: PreviewProvider {
    static var previews: some View {
        TodoWidgetView(entry: TodoEntry(date: Date(), activeTimerCount: 3, nextTimer: "집중 시간"))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
