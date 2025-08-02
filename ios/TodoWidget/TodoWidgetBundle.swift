//
//  TodoWidgetBundle.swift
//  TodoWidget
//
//  Created by Leekayoung on 7/30/25.
//

import WidgetKit
import SwiftUI

@main
struct TodoWidgetBundle: WidgetBundle {
    var body: some Widget {
        TodoWidget()              // ✅ 할일 추가 위젯

        // 아래는 예시로 다른 위젯 있을 경우 확장
        // TodoWidgetControl()
        // TodoWidgetLiveActivity()
    }
}
