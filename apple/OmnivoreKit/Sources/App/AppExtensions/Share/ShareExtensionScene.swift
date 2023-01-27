import SwiftUI
import Utils
import Views

public extension PlatformViewController {
  static func makeShareExtensionController(extensionContext: NSExtensionContext?) -> PlatformViewController {
    registerFonts()

    let hostingController = PlatformHostingController(
      rootView: ShareExtensionView(extensionContext: extensionContext)
    )
    #if os(iOS)
      hostingController.view.layer.cornerRadius = 12
      hostingController.view.layer.masksToBounds = true
      hostingController.view.layer.isOpaque = false
    #endif
    return hostingController
  }
}
