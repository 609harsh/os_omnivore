import Models
import Services
import SwiftUI
import Views
import WebKit

struct WebReaderContainerView: View {
  let item: LinkedItem

  @State private var showPreferencesPopover = false
  @State private var showLabelsModal = false
  @State private var showTitleEdit = false
  @State var showHighlightAnnotationModal = false
  @State var safariWebLink: SafariWebLink?
  @State private var navBarVisibilityRatio = 1.0
  @State private var showDeleteConfirmation = false
  @State private var progressViewOpacity = 0.0
  @State var updateFontFamilyActionID: UUID?
  @State var updateFontActionID: UUID?
  @State var updateTextContrastActionID: UUID?
  @State var updateMaxWidthActionID: UUID?
  @State var updateLineHeightActionID: UUID?
  @State var annotationSaveTransactionID: UUID?
  @State var showNavBarActionID: UUID?
  @State var shareActionID: UUID?
  @State var annotation = String()

  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) var presentationMode: Binding<PresentationMode>
  @StateObject var viewModel = WebReaderViewModel()

  func webViewActionHandler(message: WKScriptMessage, replyHandler: WKScriptMessageReplyHandler?) {
    if let replyHandler = replyHandler {
      viewModel.webViewActionWithReplyHandler(
        message: message,
        replyHandler: replyHandler,
        dataService: dataService
      )
      return
    }

    if message.name == WebViewAction.highlightAction.rawValue {
      handleHighlightAction(message: message)
    }
  }

  private func handleHighlightAction(message: WKScriptMessage) {
    guard let messageBody = message.body as? [String: String] else { return }
    guard let actionID = messageBody["actionID"] else { return }

    switch actionID {
    case "annotate":
      annotation = messageBody["annotation"] ?? ""
      showHighlightAnnotationModal = true
    default:
      break
    }
  }

  var navBar: some View {
    HStack(alignment: .center) {
      #if os(iOS)
        Button(
          action: { self.presentationMode.wrappedValue.dismiss() },
          label: {
            Image(systemName: "chevron.backward")
              .font(.appTitleTwo)
              .foregroundColor(.appGrayTextContrast)
              .padding(.horizontal)
          }
        )
        .scaleEffect(navBarVisibilityRatio)
        Spacer()
      #endif
      Button(
        action: { showPreferencesPopover.toggle() },
        label: {
          Image(systemName: "textformat.size")
            .font(.appTitleTwo)
        }
      )
      .padding(.horizontal)
      .scaleEffect(navBarVisibilityRatio)
      #if os(macOS)
        Spacer()
      #endif
      Menu(
        content: {
          Group {
            Button(
              action: { showTitleEdit = true },
              label: { Label("Edit Title/Description", systemImage: "textbox") }
            )
            Button(
              action: { showLabelsModal = true },
              label: { Label("Edit Labels", systemImage: "tag") }
            )
            Button(
              action: {
                dataService.archiveLink(objectID: item.objectID, archived: !item.isArchived)
                #if os(iOS)
                  presentationMode.wrappedValue.dismiss()
                #endif
                Snackbar.show(message: !item.isArchived ? "Link archived" : "Link moved to Inbox")
              },
              label: {
                Label(
                  item.isArchived ? "Unarchive" : "Archive",
                  systemImage: item.isArchived ? "tray.and.arrow.down.fill" : "archivebox"
                )
              }
            )
            Button(
              action: { shareActionID = UUID() },
              label: { Label("Share Original", systemImage: "square.and.arrow.up") }
            )
            Button(
              action: { showDeleteConfirmation = true },
              label: { Label("Delete", systemImage: "trash") }
            )
          }
        },
        label: {
          #if os(iOS)
            Image.profile
              .padding(.horizontal)
              .scaleEffect(navBarVisibilityRatio)
          #else
            Text("Options")
          #endif
        }
      )
      #if os(macOS)
        .frame(maxWidth: 100)
        .padding(.trailing, 16)
      #endif
    }
    .frame(height: readerViewNavBarHeight * navBarVisibilityRatio)
    .opacity(navBarVisibilityRatio)
    .background(Color.systemBackground)
    .alert("Are you sure?", isPresented: $showDeleteConfirmation) {
      Button("Remove Link", role: .destructive) {
        Snackbar.show(message: "Link removed")
        dataService.removeLink(objectID: item.objectID)
        #if os(iOS)
          presentationMode.wrappedValue.dismiss()
        #endif
      }
      Button("Cancel", role: .cancel, action: {})
    }
    .sheet(isPresented: $showLabelsModal) {
      ApplyLabelsView(mode: .item(item), onSave: { _ in showLabelsModal = false })
    }
    .sheet(isPresented: $showTitleEdit) {
      LinkedItemTitleEditView(item: item)
    }
    #if os(macOS)
      .buttonStyle(PlainButtonStyle())
    #endif
  }

  var webPreferencesPopoverView: some View {
    WebPreferencesPopoverView(
      updateFontFamilyAction: { updateFontFamilyActionID = UUID() },
      updateFontAction: { updateFontActionID = UUID() },
      updateTextContrastAction: { updateTextContrastActionID = UUID() },
      updateMaxWidthAction: { updateMaxWidthActionID = UUID() },
      updateLineHeightAction: { updateLineHeightActionID = UUID() },
      dismissAction: { showPreferencesPopover = false }
    )
  }

  var body: some View {
    ZStack {
      if let articleContent = viewModel.articleContent {
        WebReader(
          item: item,
          articleContent: articleContent,
          openLinkAction: {
            #if os(macOS)
              NSWorkspace.shared.open($0)
            #elseif os(iOS)
              safariWebLink = SafariWebLink(id: UUID(), url: $0)
            #endif
          },
          webViewActionHandler: webViewActionHandler,
          navBarVisibilityRatioUpdater: {
            navBarVisibilityRatio = $0
          },
          updateFontFamilyActionID: $updateFontFamilyActionID,
          updateFontActionID: $updateFontActionID,
          updateTextContrastActionID: $updateTextContrastActionID,
          updateMaxWidthActionID: $updateMaxWidthActionID,
          updateLineHeightActionID: $updateLineHeightActionID,
          annotationSaveTransactionID: $annotationSaveTransactionID,
          showNavBarActionID: $showNavBarActionID,
          shareActionID: $shareActionID,
          annotation: $annotation
        )
        .onTapGesture {
          withAnimation {
            navBarVisibilityRatio = 1
            showNavBarActionID = UUID()
          }
        }
        #if os(iOS)
          .fullScreenCover(item: $safariWebLink) {
            SafariView(url: $0.url)
          }
        #endif
        .sheet(isPresented: $showHighlightAnnotationModal) {
          HighlightAnnotationSheet(
            annotation: $annotation,
            onSave: {
              annotationSaveTransactionID = UUID()
              showHighlightAnnotationModal = false
            },
            onCancel: {
              showHighlightAnnotationModal = false
            }
          )
        }
      } else if let errorMessage = viewModel.errorMessage {
        Text(errorMessage).padding()
      } else {
        ProgressView()
          .opacity(progressViewOpacity)
          .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(1000)) {
              progressViewOpacity = 1
            }
          }
          .task {
            await viewModel.loadContent(dataService: dataService, itemID: item.unwrappedID)
          }
      }
      VStack(spacing: 0) {
        navBar
        Spacer()
      }
    }
    #if os(iOS)
      .formSheet(isPresented: $showPreferencesPopover, useSmallDetent: false) {
        webPreferencesPopoverView
      }
    #else
      .sheet(isPresented: $showPreferencesPopover) {
        webPreferencesPopoverView
          .frame(minWidth: 400, minHeight: 400)
      }
    #endif
    .onDisappear {
      // Clear the shared webview content when exiting
      WebViewManager.shared().loadHTMLString("<html></html>", baseURL: nil)
    }
  }
}
