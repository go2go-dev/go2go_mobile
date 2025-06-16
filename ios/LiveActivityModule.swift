import SwiftUI
import ActivityKit


@objc(LiveActivity)
class LiveActivityModule: NSObject {
  
  private var content: ActivityContent<TimerLiveActivityAttributes.ContentState>?

  @objc(startActivity)
  func startActivity() {
    do {
      if #available(iOS 16.1, *) {
        let liveActAttributes = TimerLiveActivityAttributes(name: "test")
        let liveActContentState = TimerLiveActivityAttributes.ContentState(emoji: "")
        content = ActivityContent(state: liveActContentState, staleDate: nil, relevanceScore: 1.0)
        if let content{
          try Activity.request(attributes: liveActAttributes , content: content, pushType: nil)
        }
      }
    } catch {
      print("Error")
    }
  }

  @objc(endActivity)
  func endActivity() {
    Task {
      for activity in Activity<TimerLiveActivityAttributes>.activities {
        await activity.end(content, dismissalPolicy: .default)
      }
    }
  }
}
