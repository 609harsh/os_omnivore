import CoreData
import Foundation
import Models
import SwiftGraphQL

struct InternalLinkedItemQueryResult {
  let items: [InternalLinkedItem]
  let cursor: String?
}

extension DataService {
  /// Performs GraphQL request to fetch `InternalLinkedItem`s and a cursor value
  /// - Parameters:
  ///   - limit: max number of items to return
  ///   - searchQuery: search query used by server to narrow search
  ///   - cursor: cursor to indicate batch cutoff
  /// - Returns: `InternalLinkedItemQueryResult` or a `ContentFetchError` if request fails.
  func fetchLinkedItems(
    limit: Int,
    searchQuery: String?,
    cursor: String?
  ) async throws -> InternalLinkedItemQueryResult {
    enum QueryResult {
      case success(result: InternalLinkedItemQueryResult)
      case error(error: String)
    }

    let selection = Selection<QueryResult, Unions.SearchResult> {
      try $0.on(
        searchError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        searchSuccess: .init {
          QueryResult.success(
            result: InternalLinkedItemQueryResult(
              items: try $0.edges(selection: searchItemEdgeSelection.list),
              cursor: try $0.pageInfo(selection: Selection.PageInfo {
                try $0.endCursor()
              })
            )
          )
        }
      )
    }

    let query = Selection.Query {
      try $0.search(
        after: OptionalArgument(cursor),
        first: OptionalArgument(limit),
        query: OptionalArgument(searchQuery),
        selection: selection
      )
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: ContentFetchError.network)
          return
        }

        switch payload.data {
        case let .success(result: result):
          continuation.resume(returning: result)
        case let .error(error):
          continuation.resume(throwing: ContentFetchError.unknown(description: error.description))
        }
      }
    }
  }

  /// Performs GraphQL request to fetch a single `InternalLinkedItem`
  /// - Parameters:
  ///   - username: the Viewer's username
  ///   - itemID: id of the item being requested
  /// - Returns: Returns an `InternalLinkedItem` or throws a `ContentFetchError` if
  /// request could not be completed
  func fetchLinkedItem(username: String, itemID: String) async throws -> InternalLinkedItem {
    struct ArticleProps {
      let item: InternalLinkedItem
    }

    enum QueryResult {
      case success(result: InternalLinkedItem)
      case error(error: String)
    }

    let selection = Selection<QueryResult, Unions.ArticleResult> {
      try $0.on(
        articleError: .init {
          QueryResult.error(error: try $0.errorCodes().description)
        },
        articleSuccess: .init {
          QueryResult.success(result: try $0.article(selection: libraryArticleSelection))
        }
      )
    }

    let query = Selection.Query {
      // backend has a hack that allows us to pass in itemID in place of slug
      try $0.article(slug: itemID, username: username, selection: selection)
    }

    let path = appEnvironment.graphqlPath
    let headers = networker.defaultHeaders

    return try await withCheckedThrowingContinuation { continuation in
      send(query, to: path, headers: headers) { queryResult in
        guard let payload = try? queryResult.get() else {
          continuation.resume(throwing: ContentFetchError.network)
          return
        }
        switch payload.data {
        case let .success(result: result):
          continuation.resume(returning: result)
        case let .error(error):
          continuation.resume(throwing: ContentFetchError.unknown(description: error.description))
        }
      }
    }
  }
}

private let libraryArticleSelection = Selection.Article {
  InternalLinkedItem(
    id: try $0.id(),
    title: try $0.title(),
    createdAt: try $0.createdAt().value ?? Date(),
    savedAt: try $0.savedAt().value ?? Date(),
    readAt: try $0.readAt()?.value,
    updatedAt: try $0.updatedAt().value ?? Date(),
    state: try $0.state()?.rawValue.asArticleContentStatus ?? .succeeded,
    readingProgress: try $0.readingProgressPercent(),
    readingProgressAnchor: try $0.readingProgressAnchorIndex(),
    imageURLString: try $0.image(),
    onDeviceImageURLString: nil,
    documentDirectoryPath: nil,
    pageURLString: try $0.url(),
    descriptionText: try $0.description(),
    publisherURLString: try $0.originalArticleUrl(),
    siteName: try $0.siteName(),
    author: try $0.author(),
    publishDate: try $0.publishedAt()?.value,
    slug: try $0.slug(),
    isArchived: try $0.isArchived(),
    contentReader: try $0.contentReader().rawValue,
    originalHtml: nil,
    labels: try $0.labels(selection: feedItemLabelSelection.list.nullable) ?? []
  )
}

private let searchItemSelection = Selection.SearchItem {
  InternalLinkedItem(
    id: try $0.id(),
    title: try $0.title(),
    createdAt: try $0.createdAt().value ?? Date(),
    savedAt: try $0.savedAt().value ?? Date(),
    readAt: try $0.readAt()?.value,
    updatedAt: try $0.updatedAt()?.value ?? Date(),
    state: try $0.state()?.rawValue.asArticleContentStatus ?? .succeeded,
    readingProgress: try $0.readingProgressPercent(),
    readingProgressAnchor: try $0.readingProgressAnchorIndex(),
    imageURLString: try $0.image(),
    onDeviceImageURLString: nil,
    documentDirectoryPath: nil,
    pageURLString: try $0.url(),
    descriptionText: try $0.description(),
    publisherURLString: try $0.originalArticleUrl(),
    siteName: try $0.siteName(),
    author: try $0.author(),
    publishDate: try $0.publishedAt()?.value,
    slug: try $0.slug(),
    isArchived: try $0.isArchived(),
    contentReader: try $0.contentReader().rawValue,
    originalHtml: nil,
    labels: try $0.labels(selection: feedItemLabelSelection.list.nullable) ?? []
  )
}

private let searchItemEdgeSelection = Selection.SearchItemEdge {
  try $0.node(selection: searchItemSelection)
}
