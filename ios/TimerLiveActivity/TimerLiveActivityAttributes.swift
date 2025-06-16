//
//  File.swift
//  go2go_mobile
//
//  Created by Leekayoung on 6/17/25.
//

import SwiftUI
import ActivityKit


public struct TimerLiveActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}
