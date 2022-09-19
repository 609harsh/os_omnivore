package app.omnivore.omnivore.ui.reader

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView
import app.omnivore.omnivore.models.LinkedItem

@Composable
fun WebReaderLoadingContainer(slug: String, authCookieString: String) {
  // TODO: create a viewmodel where we can fetch item and articleContent
  val item = LinkedItem(
    id = "1",
    title = "test title",
    createdAt = "",
    readAt = "",
    readingProgress = 0.0,
    readingProgressAnchor = 0,
    imageURLString = "",
    pageURLString = "https://omnivore.app",
    descriptionText = "mock item",
    publisherURLString = "",
    author = "someone",
    slug = "sluggo",
    publishDate = ""
  )

  val content = """
    <DIV 
      class=\"page\" id=\"readability-page-1\"><div><header></header><main><div p=\"0\" pb=\"6\"><p><img alt=\"Luke Zocchi and Ashley Joi using a laptop to look at Centr’s program offering.\" data-ref=\"lazy-loaded\" src=\"https://proxy-demo.omnivore-image-cache.app/0x0,sGSVXMUZphMYf-fhWm-JbW5HZfeyc8UQhXJmlVuIJoz0/https://cdn.centr.com/content/16000/15433/images/landscapewidemobile1x-loup-cen-blog-everything-you-need-to-know-about-programs-169.jpg\"></p><div><div><div><h6 mr=\"1\">MUST READ</h6><p>•</p><h6 ml=\"1\" font-weight=\"fontWeightBold\">Centr Team</h6></div><div><p><img alt=\"Centr Team\" src=\"https://proxy-demo.omnivore-image-cache.app/0x0,s1NSnC0euxK5amnfl6r6yDiFuz-v4nNVvXexCIc4I4JM/https://cdn.centr.com/content/5000/4738/images/square3x-cen-author-pic-the-expertsv2.jpg\"></p></div></div><div><p mt=\"0\">Let’s face it, starting (and sticking to) a fitness habit can be hard. The good news is when you joined Centr, Chris Hemsworth’s team of experts became YOUR team of experts, and the hard stuff doesn’t have to be so hard anymore!</p><p mt=\"0\">If you ask any Centr member, they'll tell you that one of the best ways to kickstart a fitness journey is with one of our specialized workout programs – streamlined, short-term programs that are designed to get you specific results (more on that later) and help level up your training.</p><p mt=\"0\" mb=\"0\">Let’s dive into our current Program line-up and find the program that's right for you.</p></div><div><div data-automation=\"image-set-0\"><p><img alt=\"Centr Unleashed trainers Luke Zocchi, Ashley Joi and Dan Churchill.\" data-ref=\"lazy-loaded\" src=\"https://proxy-demo.omnivore-image-cache.app/0x0,skbjeeZldWXGrxygrLNPrgaz-0RUyX3sAHYIbbyeVJfA/https://cdn.centr.com/content/16000/15433/images/landscapewidedesktop1x-43aeadc2a4cfeecd88f4e74a3d8eda54-unleashed-169.jpg\"></p><div><P><h6 font-weight=\"bold\">1</h6><h6>/<!-- -->10</h6></P></div><div><p mt=\"0\"><strong>Centr Unleashed (<a font-weight=\"inherit\" href=\"https://centr.com/program/10808\">Beginner</a>, <a font-weight=\"inherit\" href=\"https://centr.com/program/10815\">Intermediate</a> and <a font-weight=\"inherit\" href=\"https://centr.com/program/10821\">Advanced</a>)</strong><br><strong>Length:</strong> 6 weeks<br><strong>Training style:</strong> HIIT/HILIT bodyweight<br><strong>Trainers:</strong> Luke Zocchi and Ashley Joi (with special guest appearances from Dan Churchill)<br><strong>Equipment:</strong> No equipment required<br><strong>Fitness level:</strong> Beginner to Advanced – select your intensity level before you begin for a customized program.</p>
      <p mt=\"0\" mb=\"0\"><a href=\"https://centr.com/article/10529\">Centr Unleashed</a> is the all-bodyweight program that gives you the freedom to work out anywhere – no equipment required. Trainers Luke Zocchi and Ashley Joi will help you lose weight, get lean, boost your cardio, and unleash a new level of fitness. </p></div></div><div data-automation=\"image-set-1\"><p><img alt=\"Centr Power creator Chris Hemsworth with trainers Bobby Holland Hanton and Luke Zocchi.\" data-ref=\"lazy-loaded\" src=\"https://proxy-demo.omnivore-image-cache.app/0x0,sEJRFLuR9Hc_QLaydwmoQSf33qGDKbTEOoJNNzCmkB9E/https://cdn.centr.com/content/16000/15433/images/landscapewidedesktop1x-60abcfe6facb0508282baa1021ba9de6-cen-power-hero-blog-16.9.jpg\"></p><div><P><h6 font-weight=\"bold\">2</h6><h6>/<!-- -->10</h6></P></div><div><p mt=\"0\"><strong>Centr Power in Gym</strong> (<a href=\"https://centr.com/program/14578\">Beginner</a>, <a href=\"https://centr.com/program/14579\">Intermediate</a> and <a href=\"https://centr.com/program/14580\">Advanced</a>)<br><strong>Length:</strong> 13 weeks per level<br><strong>Training style:</strong> Muscle building<br><strong>Equipment:</strong> A full gym is required<br><strong>Fitness level:</strong> Beginner to Advanced – select your intensity level before you begin for a customized program.</p><p mt=\"0\" mb=\"0\">Follow in Chris Hemsworth’s footsteps to build serious muscle, strength, and size with Centr Power in Gym. Designed by Chris and his personal trainer Luke Zocchi, you’ll work side by side with Chris’s stuntman Bobby Holland Hanton for 13 weeks to achieve maximum muscle growth across three progressive levels.</p></div></div><div data-automation=\"image-set-2\"><p><img alt=\"Chris Hemsworth’s stuntman Bobby Holland Hanton, wearing a grey tank top, performs a lat pulldown exercise with a resistance band.\" data-ref=\"lazy-loaded\" src=\"https://proxy-demo.omnivore-image-cache.app/0x0,s0Fmh2Fsxs1ORKMosdNE6vd8OK7rJl97Y9gczlSIDP2E/https://cdn.centr.com/content/16000/15433/images/landscapewidedesktop1x-4336509a2630414efda4eab0426a89f9-cen22-cre-332-cen-centr-power-2022-in-app-program-header-beg-16.9.jpg\"></p><div><P><h6 font-weight=\"bold\">3</h6><h6>/<!-- -->10</h6></P></div><div><p mt=\"0\"><strong>Centr Power at Home</strong> (<a href=\"https://centr.com/program/19250\">Beginner</a>, <a href=\"https://centr.com/program/19251\">Intermediate</a> and <a href=\"https://centr.com/program/19252\">Advanced</a>)<br><strong>Length:</strong> 13 weeks per level<br><strong>Training style:</strong> Muscle building<br><strong>Equipment:</strong> Dumbbells, a bench (or box or chair) and resistance bands (with secure anchor points). If you’re training at an Advanced level, you will also require a barbell, weight plates and a pull-up bar.<br><strong>Fitness level:</strong> Beginner to Advanced – select your intensity level before you begin for a customized program.</p><p mt=\"0\" mb=\"0\">Centr Power at Home is the training program designed by Chris and Luke to get maximum results using minimal equipment. Train alongside Bobby, following the same training structure, targets and splits as the full-gym program.</p></div></div><div data-automation=\"image-set-3\"><p><img alt=\"Centr Unlimited trainers Alexz Parvi and Luke Zocchi.\" data-ref=\"lazy-loaded\" src=\"https://proxy-demo.omnivore-image-cache.app/0x0,sBzGzdnLpunNNYZ9rZZrtVKYYn0ScyMw0FqTkdZlnZ_0/https://cdn.centr.com/content/16000/15433/images/landscapewidedesktop1x-0121773808ef0434da500ee3dfabc7dd-cen-unlimited-hero-16.9.jpg\"></p><div><P><h6 font-weight=\"bold\">4</h6><h6>/<!-- -->10</h6></P></div><div><p mt=\"0\"><strong>Centr Unlimited (<a font-weight=\"inherit\" href=\"https://centr.com/program/17343\">Beginner</a>, <a font-weight=\"inherit\" href=\"https://centr.com/program/17346\">Intermediate</a> and <a font-weight=\"inherit\" href=\"https://centr.com/program/17348\">Advanced</a>)</strong><br><strong>Length:</strong> 6 weeks<br><strong>Training style:</strong> A unique mix of exercise styles including HIIT, plyo, functional, Pilates, MMA and bodyweight strength.<br><strong>Equipment:</strong> No equipment required<br><strong>Fitness level:</strong> Beginner to Advanced – select your intensity level before you begin for a customized program.</p><p mt=\"0\" mb=\"0\">We’ve teamed Luke Zocchi and Alexz Parvi to bring you a 6-week bodyweight program designed to help you burn, tone and build your fittest body ever. With 30-minute workouts and low-impact options, Centr Unlimited is suitable for anyone who wants to burn fat, improve their cardio fitness and get stronger with bodyweight.</p></div></div><div data-automation=\"image-set-4\"><p><img data-ref=\"lazy-loaded\" src=\"https://proxy-demo.omnivore-image-cache.app/0x0,s51Kof9cYNE-0HLFRAJQCuenZTBixQcgi2nA9gZFf9pc/https://cdn.centr.com/content/16000/15433/images/landscapewidedesktop1x-fda35404071d7f89eeb1adb31c447938-cen22-cre-113-ignite-hero-nolockup-16.9.jpg\"></p><div><P><h6 font-weight=\"bold\">5</h6><h6>/<!-- -->10</h6></P></div><div><p mt=\"0\"><strong>Centr Ignite (<a font-weight=\"inherit\" href=\"https://centr.com/program/18850\">Beginner</a>, <a font-weight=\"inherit\" href=\"https://centr.com/program/18851\">Intermediate</a> and <a font-weight=\"inherit\" href=\"https://centr.com/program/18852\">Advanced</a>)</strong><br><strong>Length:</strong> 6 weeks<br><strong>Training style:</strong> A mix of styles including weighted strength training, HIIT, HIRT, plyo, Pilates, MMA and functional training.<br><strong>Equipment:</strong> Dumbbells (one lighter pair and one heavier pair)<br><strong>Fitness level:</strong> Beginner to Advanced – select your intensity level before you begin for a customized program.</p><p mt=\"0\" mb=\"0\">Luke and Alexz will challenge you in all-new ways with Centr Ignite, a 6-week program that fuses classic bodyweight and dumbbell moves to activate full-body strength, sculpt every muscle and blast your cardio fitness.</p></div></div><div data-automation=\"image-set-5\"><p><img alt=\"Centr Fusion strength trainer Ashley Joi, BoxHIIT trainer Michael Olajide Jr. and PowerFlow yoga teacher Tahl Rinsky.\" data-ref=\"lazy-loaded\" src=\"https://proxy-demo.omnivore-image-cache.app/0x0,s_OLYs_wl2YLtifgm-PMErJdqAzQ_evDmIU7G_qmABgg/https://cdn.centr.com/content/16000/15433/images/landscapewidedesktop1x-11e006ea837c37036ceeaa956b5c2dbd-fusion-169.jpg\"></p><div><P><h6 font-weight=\"bold\">6</h6><h6>/<!-- -->10</h6></P></div><div><p mt=\"0\"><strong><a font-weight=\"inherit\" href=\"https://centr.com/program/13490\">Centr Fusion</a></strong><br><strong>Length:</strong> 6 weeks<br><strong>Training style:</strong> Hybrid (BoxHIIT, Strength, PowerFlow)<br><strong>Trainers:</strong> Ashley Joi, Michale Olajide Jr and Tahl Rinsky<br><strong>Equipment:</strong> A workout mat and dumbbells<br><strong>Fitness level:</strong> Beginner to Intermediate – both levels are demonstrated on screen at the same time.</p><p mt=\"0\" mb=\"0\">Centr Fusion is a program that will challenge your body and calm your mind with hybrid workouts and mindful movement. </p></div></div><div data-automation=\"image-set-6\"><p><img alt=\"Centr 6 trainers Da Rulk, Ashley Joi and Luke Zocchi.\" data-ref=\"lazy-loaded\" src=\"https://proxy-demo.omnivore-image-cache.app/0x0,sDnDwEgpeUF-xyEVbzaCpeRDqJqUEmCxPgPGZZnKc1JA/https://cdn.centr.com/content/16000/15433/images/landscapewidedesktop1x-8207c22f698476a7f232c793589b6197-centr6-169.jpg\"></p><div><P><h6 font-weight=\"bold\">7</h6><h6>/<!-- -->10</h6></P></div><div><p mt=\"0\"><strong><a font-weight=\"inherit\" href=\"https://centr.com/program/9919\">Centr 6</a></strong><br><strong>Length:</strong> 6 weeks<br><strong>Training style:</strong> Cardio and strength<br><strong>Trainers:</strong> Luke Zocchi, Da Rulk and Ashley Joi<br><strong>Equipment:</strong> Just your body and a set of dumbbells<br><strong>Fitness level:</strong> Beginner to Advanced – just follow the trainer doing the moves for your intensity level.</p><p mt=\"0\" mb=\"0\">If you’re new to training, making a comeback, or ready to level up, <a href=\"https://centr.com/article/9583\">Centr 6</a> is the program designed to kickstart your fitness goals. Inspired by the anytime, anywhere style of training that Chris finds most effective and enjoyable, Centr 6 can be done at home with minimal equipment – and will prove to you that training doesn’t have to be complicated. </p></div></div><div data-automation=\"image-set-7\"><p><img alt=\"Centr 6: Phase II trainers Da Rulk, Ashley Joi and Luke Zocchi.\" data-ref=\"lazy-loaded\" src=\"https://proxy-demo.omnivore-image-cache.app/0x0,sMn6U1mOedVYCkW7awS7ofCMhgAJvjiP2Rf9cvKdI7GU/https://cdn.centr.com/content/16000/15433/images/landscapewidedesktop1x-cb2e4fb6420f2be05dfa4167be16e515-c6p2-169.jpg\"></p><div><P><h6 font-weight=\"bold\">8</h6><h6>/<!-- -->10</h6></P></div><div><p mt=\"0\"><strong><a font-weight=\"inherit\" href=\"https://centr.com/program/12213\">Centr 6: Phase II</a></strong><br><strong>Length:</strong> 6 weeks<br><strong>Training style:</strong> Cardio and strength<br><strong>Trainers:</strong> Luke Zocchi, Da Rulk and Ashley Joi<br><strong>Equipment:</strong> Dumbbells<br><strong>Fitness level:</strong>  Beginner to Advanced – just follow the trainer doing the exercise variations for your intensity level.</p><p mt=\"0\" mb=\"0\">Centr 6: Phase II is the follow-up program to Centr 6. Like the original program, Centr 6: Phase II will show you how to harness the power of consistency and repetition to push your training to the next level. Trainers Luke Zocchi, Ashley Joi and Da Rulk will guide you through bodyweight and weighted moves in an accessible style of training that Chris Hemsworth enjoys when he’s on the road. </p></div></div><div data-automation=\"image-set-8\"><p><img alt=\"Chris Hemsworth’s functional trainer Joseph ‘Da Rulk’ Sakoda does one of his signature exercises – a switch.\" data-ref=\"lazy-loaded\" src=\"https://proxy-demo.omnivore-image-cache.app/0x0,s1ntQHuZZsX_tfuoOXYeQePCX09DGsJ7UkQoyxHNqNe0/https://cdn.centr.com/content/16000/15433/images/landscapewidedesktop1x-e0fa05a913eac64c2cc4d3af7ab33927-masterclass-169.jpg\"></p><div><P><h6 font-weight=\"bold\">9</h6><h6>/<!-- -->10</h6></P></div><div><p mt=\"0\"><strong><a font-weight=\"inherit\" href=\"https://centr.com/program/12954\">Centr Masterclass: Da Rulk</a></strong><br><strong>Length:</strong> 13 sessions<br><strong>Training style:</strong> Functional training<br><strong>Trainers:</strong> Da Rulk<br><strong>Equipment:</strong> None<br><strong>Fitness level:</strong> Beginner to Advanced – everyone starts with the Beginner series, and you move on as you master the moves. </p><p mt=\"0\" mb=\"0\">Looking to unlock your body’s potential and learn to move like never before? Centr Masterclass: Da Rulk is just what you’ve been searching for.   </p></div></div><div data-automation=\"image-set-9\"><p><img alt=\"Centr’s yoga teacher Tahl Rinsky and Pilates instructor Sylvia Roberts pose in a bright room where the Centr Align program was filmed.\" data-ref=\"lazy-loaded\" src=\"https://proxy-demo.omnivore-image-cache.app/0x0,sZPMfmvF6eJCKoE_X7ZBA4cSy4ILF5AIcUmGl7FSSJYY/https://cdn.centr.com/content/16000/15433/images/landscapewidedesktop1x-565a1f008f68369ee655e742bb50f2b6-20210406-cen-align-hero-169-nolockup.jpg\"></p><div><P><h6 font-weight=\"bold\">10</h6><h6>/<!-- -->10</h6></P></div><div><p mt=\"0\"><strong><a font-weight=\"inherit\" href=\"https://centr.com/program/14213\">Centr Align</a></strong><br><strong>Length:</strong> 4 weeks<br><strong>Training style:</strong> Yoga and Pilates<br><strong>Trainers:</strong> Sylvia Roberts and Tahl Rinksy (with special guest appearances from Luke Zocchi and Bobby Holland Hanton)<br><strong>Equipment:</strong> None<br><strong>Fitness level:</strong> Beginner to Intermediate</p><p mt=\"0\" mb=\"0\">In Centr Align, yoga meets Pilates to help you build strength, tone, and confidence. Designed by dynamic yoga expert Tahl Rinsky and Pilates instructor Sylvia Roberts (and featuring guest appearances from Luke Zocchi and Bobby Holland Hanton), Centr Align combines two distinct but complementary training modalities for a program that offers full-body benefits.</p></div></div></div></div></div></main></div>
    </DIV>
    """

  val articleContent = ArticleContent(
    title = "test title",
    htmlContent = content,
    highlightsJSONString = "[]",
    contentStatus = "SUCCEEDED",
    objectID = ""
  )

  WebReader(item = item, articleContent = articleContent)
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebReader(item: LinkedItem, articleContent: ArticleContent) {
  WebView.setWebContentsDebuggingEnabled(true)

  val webReaderContent = WebReaderContent(
    textFontSize = 12,
    lineHeight =  150,
    maxWidthPercentage = 100,
    item = item,
    themeKey = "LightGray",
    fontFamily = WebFont.SYSTEM ,
    articleContent = articleContent,
    prefersHighContrastText = false,
  )

  val styledContent = webReaderContent.styledContent()

  AndroidView(factory = {
    WebView(it).apply {
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )

      settings.javaScriptEnabled = true
      settings.allowContentAccess = true
      settings.allowFileAccess = true
      settings.domStorageEnabled = true

      webViewClient = object : WebViewClient() {
      }

      loadDataWithBaseURL("file:///android_asset/", styledContent, "text/html; charset=utf-8", "utf-8", null);

    }
  }, update = {
    it.loadDataWithBaseURL("file:///android_asset/", styledContent, "text/html; charset=utf-8", "utf-8", null);
  })
}
