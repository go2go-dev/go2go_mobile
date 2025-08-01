//
//  TodoWidgetLiveActivity.swift
//  TodoWidget
//
//  Created by Leekayoung on 7/30/25.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct TodoWidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct TodoWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TodoWidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension TodoWidgetAttributes {
    fileprivate static var preview: TodoWidgetAttributes {
        TodoWidgetAttributes(name: "World")
    }
}

extension TodoWidgetAttributes.ContentState {
    fileprivate static var smiley: TodoWidgetAttributes.ContentState {
        TodoWidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: TodoWidgetAttributes.ContentState {
         TodoWidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: TodoWidgetAttributes.preview) {
   TodoWidgetLiveActivity()
} contentStates: {
    TodoWidgetAttributes.ContentState.smiley
    TodoWidgetAttributes.ContentState.starEyes
}
