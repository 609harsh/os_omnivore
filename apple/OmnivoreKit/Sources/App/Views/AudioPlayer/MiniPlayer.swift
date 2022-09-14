//
//  MiniPlayer.swift
//
//
//  Created by Jackson Harper on 8/15/22.
//

import Foundation
import Models
import Services
import SwiftUI
import Views

public struct MiniPlayer: View {
  @EnvironmentObject var audioController: AudioController
  @Environment(\.colorScheme) private var colorScheme: ColorScheme
  private let presentingView: AnyView

  @State var expanded = false
  @State var offset: CGFloat = 0
  @State var showVoiceSheet = false
  @Namespace private var animation

  let minExpandedHeight = UIScreen.main.bounds.height / 3

  init<PresentingView>(
    presentingView: PresentingView
  ) where PresentingView: View {
    self.presentingView = AnyView(presentingView)
  }

  var isPresented: Bool {
    audioController.itemAudioProperties != nil && audioController.state != .stopped
  }

  var playPauseButtonImage: String {
    switch audioController.state {
    case .playing:
      return "pause.circle"
    case .paused:
      return "play.circle"
    case .reachedEnd:
      return "gobackward"
    default:
      return ""
    }
  }

  var playPauseButtonItem: some View {
    if let itemID = audioController.itemAudioProperties?.itemID, audioController.isLoadingItem(itemID: itemID) {
      return AnyView(ProgressView())
    } else {
      return AnyView(Button(
        action: {
          switch audioController.state {
          case .playing:
            audioController.pause()
          case .paused:
            audioController.unpause()
          case .reachedEnd:
            audioController.seek(to: 0.0)
            audioController.unpause()
          default:
            break
          }
        },
        label: {
          Image(systemName: playPauseButtonImage)
            .font(expanded ? .system(size: 64.0, weight: .thin) : .appTitleTwo)
        }
      ))
    }
  }

  var stopButton: some View {
    Button(
      action: {
        audioController.stop()
      },
      label: {
        Image(systemName: "xmark")
          .font(.appTitleTwo)
      }
    )
  }

//  var shareButton: some View {
//    Button(
//      action: {
//        let shareActivity = UIActivityViewController(activityItems: [self.audioSession.localAudioUrl], applicationActivities: nil)
//        if let vc = UIApplication.shared.windows.first?.rootViewController {
//          shareActivity.popoverPresentationController?.sourceView = vc.view
//          // Setup share activity position on screen on bottom center
//          shareActivity.popoverPresentationController?.sourceRect = CGRect(x: UIScreen.main.bounds.width / 2, y: UIScreen.main.bounds.height, width: 0, height: 0)
//          shareActivity.popoverPresentationController?.permittedArrowDirections = UIPopoverArrowDirection.down
//          vc.present(shareActivity, animated: true, completion: nil)
//        }
//      },
//      label: {
//        Image(systemName: "square.and.arrow.up")
//          .font(.appCallout)
//          .tint(.appGrayText)
//      }
//    )
//  }

  var closeButton: some View {
    Button(
      action: {
        withAnimation(.interactiveSpring()) {
          self.expanded = false
        }
      },
      label: {
        Image(systemName: "chevron.down")
          .font(.appCallout)
          .tint(.appGrayText)
      }
    )
  }

  func viewArticle() {
    if let objectID = audioController.itemAudioProperties?.objectID {
      NSNotification.pushReaderItem(objectID: objectID)
      withAnimation(.easeIn(duration: 0.1)) {
        expanded = false
      }
    }
  }

  // swiftlint:disable:next function_body_length
  func playerContent(_ itemAudioProperties: LinkedItemAudioProperties) -> some View {
    GeometryReader { geom in
      VStack {
        if expanded {
          ZStack {
            closeButton
              .padding(.top, 24)
              .frame(maxWidth: .infinity, alignment: .leading)

//            shareButton
//              .padding(.top, 8)
//              .frame(maxWidth: .infinity, alignment: .trailing)

            Capsule()
              .fill(.gray)
              .frame(width: 60, height: 4)
              .padding(.top, 8)
              .transition(.opacity)
          }
        }

        Spacer(minLength: 0)

        HStack {
          let maxSize = 2 * (min(geom.size.width, geom.size.height) / 3)
          let dim = expanded ? maxSize : 64

          AsyncImage(url: itemAudioProperties.imageURL) { image in
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
              .frame(width: dim, height: dim)
              .cornerRadius(6)
          } placeholder: {
            Color.appButtonBackground
              .frame(width: dim, height: dim)
              .cornerRadius(6)
          }

          if !expanded {
            Text(itemAudioProperties.title)
              .font(expanded ? .appTitle : .appCallout)
              .lineSpacing(1.25)
              .foregroundColor(.appGrayTextContrast)
              .fixedSize(horizontal: false, vertical: false)
              .frame(maxWidth: .infinity, alignment: expanded ? .center : .leading)
              .matchedGeometryEffect(id: "ArticleTitle", in: animation)

            playPauseButtonItem
              .frame(width: 28, height: 28)

            stopButton
              .frame(width: 28, height: 28)
          }
        }

        Spacer()

        if expanded {
          Text(itemAudioProperties.title)
            .lineLimit(1)
            .font(expanded ? .appTitle : .appCallout)
            .lineSpacing(1.25)
            .foregroundColor(.appGrayTextContrast)
            .frame(maxWidth: .infinity, alignment: expanded ? .center : .leading)
            .matchedGeometryEffect(id: "ArticleTitle", in: animation)
            .onTapGesture {
              viewArticle()
            }

          HStack {
            Spacer()
            if let author = itemAudioProperties.author {
              Text(author)
                .lineLimit(1)
                .font(.appCallout)
                .lineSpacing(1.25)
                .foregroundColor(.appGrayText)
                .frame(alignment: .trailing)
            }
            if itemAudioProperties.author != nil, itemAudioProperties.siteName != nil {
              Text(" • ")
                .font(.appCallout)
                .lineSpacing(1.25)
                .foregroundColor(.appGrayText)
            }
            if let siteName = itemAudioProperties.siteName {
              Text(siteName)
                .lineLimit(1)
                .font(.appCallout)
                .lineSpacing(1.25)
                .foregroundColor(.appGrayText)
                .frame(alignment: .leading)
            }
            Spacer()
          }

          Slider(value: $audioController.timeElapsed,
                 in: 0 ... self.audioController.duration,
                 onEditingChanged: { scrubStarted in
                   if scrubStarted {
                     self.audioController.scrubState = .scrubStarted
                   } else {
                     self.audioController.scrubState = .scrubEnded(self.audioController.timeElapsed)
                   }
                 })
            .accentColor(.appCtaYellow)
            .introspectSlider { slider in
              // Make the thumb a little smaller than the default and give it the CTA color
              // for some reason this doesn't work on my iPad though.
              let tintColor = UIColor(Color.appCtaYellow)

              let image = UIImage(systemName: "circle.fill",
                                  withConfiguration: UIImage.SymbolConfiguration(scale: .small))?
                .withTintColor(tintColor)
                .withRenderingMode(.alwaysOriginal)

              slider.setThumbImage(image, for: .selected)
              slider.setThumbImage(image, for: .normal)

              slider.minimumTrackTintColor = tintColor
            }

          HStack {
            Text(audioController.timeElapsedString ?? "0:00")
              .font(.appCaptionTwo)
              .foregroundColor(.appGrayText)
            Spacer()
            Text(audioController.durationString ?? "0:00")
              .font(.appCaptionTwo)
              .foregroundColor(.appGrayText)
          }

          HStack {
            Menu {
              playbackRateButton(rate: 1.0, title: "1.0×", selected: audioController.playbackRate == 1.0)
              playbackRateButton(rate: 1.1, title: "1.1×", selected: audioController.playbackRate == 1.1)
              playbackRateButton(rate: 1.2, title: "1.2×", selected: audioController.playbackRate == 1.2)
              playbackRateButton(rate: 1.5, title: "1.5×", selected: audioController.playbackRate == 1.5)
              playbackRateButton(rate: 1.7, title: "1.7×", selected: audioController.playbackRate == 1.7)
              playbackRateButton(rate: 2.0, title: "2.0×", selected: audioController.playbackRate == 2.0)
            } label: {
              VStack {
                Text(String(format: "%.1f×", audioController.playbackRate))
                  .font(.appCallout)
                  .lineLimit(0)
              }
              .contentShape(Rectangle())
            }
            .padding(8)

            Button(
              action: { self.audioController.skipBackwards(seconds: 30) },
              label: {
                Image(systemName: "gobackward.30")
                  .font(.appTitleTwo)
              }
            )

            playPauseButtonItem
              .frame(width: 64, height: 64)
              .padding(32)

            Button(
              action: { self.audioController.skipForward(seconds: 30) },
              label: {
                Image(systemName: "goforward.30")
                  .font(.appTitleTwo)
              }
            )

            Menu {
              Button("View Article", action: { viewArticle() })
              Button("Change Voice", action: { showVoiceSheet = true })
            } label: {
              VStack {
                Image(systemName: "ellipsis")
                  .font(.appCallout)
                  .frame(width: 20, height: 20)
              }
              .contentShape(Rectangle())
            }
            .padding(8)
          }
        }
      }
      .padding(EdgeInsets(top: 0, leading: expanded ? 24 : 6, bottom: 0, trailing: expanded ? 24 : 6))
      .background(
        Color.systemBackground
          .shadow(color: expanded ? .clear : .gray.opacity(0.33), radius: 8, x: 0, y: 4)
          .mask(Rectangle().padding(.top, -20))
      )
      .onTapGesture {
        withAnimation(.easeIn(duration: 0.08)) { expanded = true }
      }.sheet(isPresented: $showVoiceSheet) {
        changeVoiceView
      }
    }
  }

  func playbackRateButton(rate: Double, title: String, selected: Bool) -> some View {
    Button(action: {
      audioController.playbackRate = rate
    }) {
      HStack {
        Text(title)
        Spacer()
        if selected {
          Image(systemName: "checkmark")
        }
      }
      .contentShape(Rectangle())
    }
    .buttonStyle(PlainButtonStyle())
  }

  public var body: some View {
    ZStack(alignment: .center) {
      presentingView
      if let itemAudioProperties = self.audioController.itemAudioProperties, isPresented {
        ZStack(alignment: .bottom) {
          Color.systemBackground.edgesIgnoringSafeArea(.bottom)
            .frame(height: 88, alignment: .bottom)

          VStack {
            Spacer(minLength: 0)
            playerContent(itemAudioProperties)
              .offset(y: offset)
              .frame(maxHeight: expanded ? .infinity : 88)
              .tint(.appGrayTextContrast)
              .gesture(DragGesture().onEnded(onDragEnded(value:)).onChanged(onDragChanged(value:)))
              .background(expanded ? .clear : .systemBackground)
          }
        }
      }
    }
  }

  var changeVoiceView: some View {
    NavigationView {
      VStack {
        List {
          ForEach(audioController.voiceList ?? [], id: \.key.self) { voice in
            Button(action: {
              audioController.currentVoice = voice.key
              self.showVoiceSheet = false
            }) {
              HStack {
                Text(voice.name)

                Spacer()

                if voice.selected {
                  Image(systemName: "checkmark")
                }
              }
              .contentShape(Rectangle())
            }
            .buttonStyle(PlainButtonStyle())
          }
        }
        .padding(.top, 32)
        .listStyle(.plain)
        Spacer()
      }
      .navigationBarTitle("Voice")
      .navigationBarTitleDisplayMode(.inline)
      .navigationBarItems(leading: Button(action: { self.showVoiceSheet = false }) {
        Image(systemName: "chevron.backward")
      })
    }
  }

  func onDragChanged(value: DragGesture.Value) {
    if value.translation.height > 0, expanded {
      offset = value.translation.height
    }
  }

  func onDragEnded(value: DragGesture.Value) {
    withAnimation(.interactiveSpring()) {
      if value.translation.height > minExpandedHeight {
        expanded = false
      }
      offset = 0
    }
  }
}

public extension View {
  func miniPlayer() -> some View {
    MiniPlayer(presentingView: self)
  }
}
