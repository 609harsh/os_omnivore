import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class ProfileContainerViewModel: ObservableObject {
  @Published var isLoading = false
  @Published var profileCardData = ProfileCardData()
  @Published var deleteAccountErrorMessage: String?

  var appVersionString: String {
    if let appVersion = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String {
      return "Omnivore Version \(appVersion)"
    } else {
      return ""
    }
  }

  func loadProfileData(dataService: DataService) async {
    if let currentViewer = dataService.currentViewer {
      loadProfileCardData(viewer: currentViewer)
      return
    }

    guard let viewerObjectID = try? await dataService.fetchViewer() else { return }

    await dataService.viewContext.perform {
      if let viewer = dataService.viewContext.object(with: viewerObjectID) as? Viewer {
        self.loadProfileCardData(viewer: viewer)
      }
    }
  }

  func deleteAccount(dataService: DataService, authenticator: Authenticator) async {
    guard let currentViewer = dataService.currentViewer else {
      deleteAccountErrorMessage = "Unable to load account information."
      return
    }

    do {
      try await dataService.deleteAccount(userID: currentViewer.unwrappedUserID)
      authenticator.logout(dataService: dataService, isAccountDeletion: true)
      EventTracker.reset()
    } catch {
      deleteAccountErrorMessage = "We were unable to delete your account."
    }
  }

  private func loadProfileCardData(viewer: Viewer) {
    profileCardData = ProfileCardData(
      name: viewer.unwrappedName,
      username: viewer.unwrappedUsername,
      imageURL: viewer.profileImageURL.flatMap { URL(string: $0) }
    )
  }
}

struct ProfileView: View {
  @EnvironmentObject var authenticator: Authenticator
  @EnvironmentObject var dataService: DataService
  @Environment(\.openURL) var openURL
  @Environment(\.dismiss) var dismiss

  @StateObject private var viewModel = ProfileContainerViewModel()

  @State private var showLogoutConfirmation = false

  var body: some View {
    #if os(iOS)
      Form {
        innerBody
      }
      .navigationTitle(LocalText.genericProfile)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .navigationBarTrailing) {
          dismissButton
        }
      }
    #elseif os(macOS)
      List {
        innerBody
      }
      .listStyle(InsetListStyle())
      .frame(minWidth: 400, minHeight: 600)
    #endif
  }

  var dismissButton: some View {
    Button(
      action: { dismiss() },
      label: { Text(LocalText.genericClose) }
    )
  }

  private var accountSection: some View {
    Section {
      NavigationLink(destination: LabelsView()) {
        Text(LocalText.labelsGeneric)
      }

      NavigationLink(destination: NewsletterEmailsView()) {
        Text(LocalText.emailsGeneric)
      }

      NavigationLink(destination: SubscriptionsView()) {
        Text(LocalText.subscriptionsGeneric)
      }

      #if os(iOS)
        NavigationLink(destination: GroupsView()) {
          Text(LocalText.clubsGeneric)
        }
      #endif

      NavigationLink(destination: FiltersView()) {
        Text(LocalText.filtersGeneric)
      }
    }
  }

  private var innerBody: some View {
    Group {
      Section {
        ProfileCard(data: viewModel.profileCardData)
          .task {
            await viewModel.loadProfileData(dataService: dataService)
          }
      }

      accountSection

      #if os(iOS)
        Section {
          NavigationLink(destination: PushNotificationSettingsView()) {
            Text(LocalText.pushNotificationsGeneric)
          }
          NavigationLink(destination: TextToSpeechView()) {
            Text(LocalText.textToSpeechGeneric)
          }
        }
      #endif

      Section {
        Button(
          action: {
            if let url = URL(string: "https://docs.omnivore.app") {
              openURL(url)
            }
          },
          label: { Text(LocalText.documentationGeneric) }
        )

        #if os(iOS)
          Button(
            action: { DataService.showIntercomMessenger?() },
            label: { Text(LocalText.feedbackGeneric) }
          )
        #endif

        NavigationLink(
          destination: BasicWebAppView.privacyPolicyWebView(baseURL: dataService.appEnvironment.webAppBaseURL)
        ) {
          Text(LocalText.privacyPolicyGeneric)
        }

        NavigationLink(
          destination: BasicWebAppView.termsConditionsWebView(baseURL: dataService.appEnvironment.webAppBaseURL)
        ) {
          Text(LocalText.termsAndConditionsGeneric)
        }
      }

      Section(footer: Text(viewModel.appVersionString)) {
        NavigationLink(
          destination: ManageAccountView()
        ) {
          Text(LocalText.manageAccountGeneric)
        }

        Text(LocalText.logoutGeneric)
          .onTapGesture {
            showLogoutConfirmation = true
          }
          .alert(isPresented: $showLogoutConfirmation) {
            Alert(
              title: Text(LocalText.profileConfirmLogoutMessage),
              primaryButton: .destructive(Text(LocalText.genericConfirm)) {
                dismiss()
                DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
                  authenticator.logout(dataService: dataService)
                }
              },
              secondaryButton: .cancel()
            )
          }
      }
    }
  }
}

extension BasicWebAppView {
  static func privacyPolicyWebView(baseURL: URL) -> BasicWebAppView {
    omnivoreWebView(path: "/app/privacy", baseURL: baseURL)
  }

  static func termsConditionsWebView(baseURL: URL) -> BasicWebAppView {
    omnivoreWebView(path: "/app/terms", baseURL: baseURL)
  }

  private static func omnivoreWebView(path: String, baseURL: URL) -> BasicWebAppView {
    let url: URL = {
      var urlComponents = URLComponents()
      urlComponents.path = path
      return urlComponents.url(relativeTo: baseURL)!
    }()

    return BasicWebAppView(request: URLRequest(url: url))
  }
}
