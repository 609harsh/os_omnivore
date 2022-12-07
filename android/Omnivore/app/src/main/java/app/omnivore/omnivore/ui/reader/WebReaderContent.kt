package app.omnivore.omnivore.ui.reader

import app.omnivore.omnivore.models.Highlight
import app.omnivore.omnivore.models.LinkedItem
import com.google.gson.Gson

enum class WebFont(val displayText: String, val rawValue: String) {
  INTER("Inter", "Inter"),
  SYSTEM("System Default", "unset"),
  OPEN_DYSLEXIC("Open Dyslexic", "OpenDyslexic"),
  MERRIWEATHER("Merriweather", "Merriweather"),
  LORA("Lora", "Lora"),
  OPEN_SANS("Open Sans", "Open Sans"),
  ROBOTO("Roboto", "Roboto"),
  CRIMSON_TEXT("Crimson Text", "Crimson Text"),
  SOURCE_SERIF_PRO("Source Serif Pro", "Source Serif Pro"),
}

enum class ArticleContentStatus(val rawValue: String) {
  FAILED("FAILED"),
  PROCESSING("PROCESSING"),
  SUCCEEDED("SUCCEEDED"),
  UNKNOWN("UNKNOWN")
}

data class ArticleContent(
  val title: String,
  val htmlContent: String,
  val highlights: List<Highlight>,
  val contentStatus: String, // ArticleContentStatus,
  val objectID: String?, // whatever the Room Equivalent of objectID is
  val labelsJSONString: String
) {
  fun highlightsJSONString(): String {
    return Gson().toJson(highlights)
  }
}

data class WebReaderContent(
  val preferences: WebPreferences,
  val item: LinkedItem,
  val themeKey: String,
  val articleContent: ArticleContent,
) {
  fun styledContent(): String {
    // TODO: Kotlinize these three values (pasted from Swift)
    val savedAt = "new Date(1662571290735.0).toISOString()"
    val createdAt = "new Date().toISOString()"
    val publishedAt =
      "new Date().toISOString()" //if (item.publishDate != null) "new Date((item.publishDate!.timeIntervalSince1970 * 1000)).toISOString()" else "undefined"
    val textFontSize = preferences.textFontSize
    val highlightCssFilePath = "highlight${if (themeKey == "Gray") "-dark" else ""}.css"

    return """
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no' />
                <style>
                  @import url("$highlightCssFilePath");
                </style>
            </head>
            <body>
              <div id="root" />
              <div id='_omnivore-htmlContent'>
                ${articleContent.htmlContent}
              </div>
              <script type="text/javascript">
                window.omnivoreEnv = {
                  "NEXT_PUBLIC_APP_ENV": "prod",
                  "NEXT_PUBLIC_BASE_URL": "unset",
                  "NEXT_PUBLIC_SERVER_BASE_URL": "unset",
                  "NEXT_PUBLIC_HIGHLIGHTS_BASE_URL": "unset"
                }

                window.omnivoreArticle = {
                  id: "${item.id}",
                  linkId: "${item.id}",
                  slug: "${item.slug}",
                  createdAt: new Date(1662571290735.0).toISOString(),
                  savedAt: new Date(1662571290981.0).toISOString(),
                  publishedAt: new Date(1662454816000.0).toISOString(),
                  url: `${item.pageURLString}`,
                  title: `${articleContent.title.replace("`", "\\`")}`,
                  content: document.getElementById('_omnivore-htmlContent').innerHTML,
                  originalArticleUrl: "${item.pageURLString}",
                  contentReader: "WEB",
                  readingProgressPercent: ${item.readingProgress},
                  readingProgressAnchorIndex: ${item.readingProgressAnchor},
                  labels: ${articleContent.labelsJSONString},
                  highlights: ${articleContent.highlightsJSONString()},
                }

                window.fontSize = $textFontSize
                window.fontFamily = "${preferences.fontFamily.rawValue}"
                window.maxWidthPercentage = $preferences.maxWidthPercentage
                window.lineHeight = $preferences.lineHeight
                window.localStorage.setItem("theme", "$themeKey")
                window.prefersHighContrastFont = $preferences.prefersHighContrastText
                window.enableHighlightBar = false
              </script>
              <script src="bundle.js"></script>
              <script src="mathJaxConfiguration.js" id="MathJax-script"></script>
              <script src="mathjax.js" id="MathJax-script"></script>
            </body>
          </html>
    """
  }
}
