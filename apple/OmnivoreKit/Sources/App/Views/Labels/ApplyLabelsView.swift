import Models
import Services
import SwiftUI
import Views

struct ApplyLabelsView: View {
  enum Mode {
    case item(LinkedItem)
    case highlight(Highlight)
    case list([LinkedItemLabel])

    var navTitle: String {
      switch self {
      case .item, .highlight:
        return "Assign Labels"
      case .list:
        return "Apply Label Filters"
      }
    }

    var confirmButtonText: String {
      switch self {
      case .item, .highlight:
        return "Save"
      case .list:
        return "Apply"
      }
    }
  }

  let mode: Mode
  let onSave: (([LinkedItemLabel]) -> Void)?

  @EnvironmentObject var dataService: DataService
  @Environment(\.presentationMode) private var presentationMode
  @StateObject var viewModel = LabelsViewModel()

  func isSelected(_ label: LinkedItemLabel) -> Bool {
    viewModel.selectedLabels.contains(where: { $0.id == label.id })
  }

  var innerBody: some View {
    List {
      Section {
        Button(
          action: { viewModel.showCreateLabelModal = true },
          label: {
            HStack {
              Image(systemName: "plus.circle.fill").foregroundColor(.green)
              Text(LocalText.createLabelMessage).foregroundColor(.appGrayTextContrast)
              Spacer()
            }
          }
        )
        .disabled(viewModel.isLoading)
      }
      Section {
        ForEach(viewModel.labels.applySearchFilter(viewModel.labelSearchFilter), id: \.self) { label in
          Button(
            action: {
              if isSelected(label) {
                viewModel.selectedLabels.removeAll(where: { $0.id == label.id })
              } else {
                viewModel.selectedLabels.append(label)
              }
            },
            label: {
              HStack {
                TextChip(feedItemLabel: label)
                Spacer()
                if isSelected(label) {
                  Image(systemName: "checkmark")
                }
              }
            }
          )
          #if os(macOS)
            .buttonStyle(PlainButtonStyle())
          #endif
        }
      }
    }
    .navigationTitle(mode.navTitle)
    #if os(iOS)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          cancelButton
        }
        ToolbarItem(placement: .navigationBarTrailing) {
          saveItemChangesButton
        }
      }
    #else
      .toolbar {
        ToolbarItemGroup {
          cancelButton
          saveItemChangesButton
        }
      }
    #endif
    .sheet(isPresented: $viewModel.showCreateLabelModal) {
      CreateLabelView(viewModel: viewModel)
    }
  }

  var saveItemChangesButton: some View {
    Button(
      action: {
        switch mode {
        case let .item(feedItem):
          viewModel.saveItemLabelChanges(itemID: feedItem.unwrappedID, dataService: dataService)
        case .highlight:
          onSave?(viewModel.selectedLabels)
        case .list:
          onSave?(viewModel.selectedLabels)
        }
        presentationMode.wrappedValue.dismiss()
      },
      label: { Text(mode.confirmButtonText).foregroundColor(.appGrayTextContrast) }
    )
  }

  var cancelButton: some View {
    Button(
      action: { presentationMode.wrappedValue.dismiss() },
      label: { Text(LocalText.cancelGeneric).foregroundColor(.appGrayTextContrast) }
    )
  }

  var body: some View {
    Group {
      #if os(iOS)
        NavigationView {
          if viewModel.isLoading {
            EmptyView()
          } else {
            innerBody
              .searchable(
                text: $viewModel.labelSearchFilter,
                placement: .navigationBarDrawer(displayMode: .always)
              )
          }
        }
      #elseif os(macOS)
        innerBody
          .frame(minWidth: 400, minHeight: 400)
      #endif
    }
    .task {
      switch mode {
      case let .item(feedItem):
        await viewModel.loadLabels(dataService: dataService, item: feedItem)
      case let .highlight(highlight):
        await viewModel.loadLabels(dataService: dataService, highlight: highlight)
      case let .list(labels):
        await viewModel.loadLabels(dataService: dataService, initiallySelectedLabels: labels)
      }
    }
  }
}

extension Sequence where Element == LinkedItemLabel {
  func applySearchFilter(_ searchFilter: String) -> [LinkedItemLabel] {
    if searchFilter.isEmpty {
      return map { $0 } // return the identity of the sequence
    }
    return filter { ($0.name ?? "").lowercased().contains(searchFilter.lowercased()) }
  }
}
