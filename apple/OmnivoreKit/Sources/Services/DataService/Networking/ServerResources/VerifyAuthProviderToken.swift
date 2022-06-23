import Foundation
import Models

extension Networker {
  func submitAppleToken(token: String) async throws -> AuthPayload {
    let params = SignInParams(token: token, provider: .apple)
    return try await submitSignInParams(params: params)
  }

  func submitGoogleToken(idToken: String) async throws -> AuthPayload {
    let params = SignInParams(token: idToken, provider: .google)
    return try await submitSignInParams(params: params)
  }

  func submitSignInParams(params: SignInParams) async throws -> AuthPayload {
    let encodedParams = (try? JSONEncoder().encode(params)) ?? Data()

    let urlRequest = URLRequest.create(
      baseURL: appEnvironment.serverBaseURL,
      urlPath: "/api/mobile-auth/sign-in",
      requestMethod: .post(params: encodedParams)
    )

    let resource = ServerResource<AuthPayload>(
      urlRequest: urlRequest,
      decode: AuthPayload.decode
    )

    do {
      return try await urlSession.performRequest(resource: resource)
    } catch {
      if let error = error as? ServerError {
        throw LoginError.make(serverError: error)
      } else {
        throw LoginError.unknown
      }
    }
  }
}
