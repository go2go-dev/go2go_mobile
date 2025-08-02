import Foundation
import WidgetKit

@objc class WidgetBridge: NSObject {
  @objc static func reloadAllWidgets() {
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}
