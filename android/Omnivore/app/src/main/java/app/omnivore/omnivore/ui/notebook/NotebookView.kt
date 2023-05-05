package app.omnivore.omnivore.ui.notebook

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.LocalOnBackPressedDispatcherOwner
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.omnivore.omnivore.MainActivity
import app.omnivore.omnivore.R
import app.omnivore.omnivore.persistence.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.ui.library.*
import app.omnivore.omnivore.ui.theme.OmnivoreTheme
import com.google.accompanist.systemuicontroller.rememberSystemUiController
import dagger.hilt.android.AndroidEntryPoint
import dev.jeziellago.compose.markdowntext.MarkdownText
import kotlinx.coroutines.launch


@AndroidEntryPoint
class NotebookActivity: ComponentActivity() {
    val viewModel: NotebookViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val savedItemId = intent.getStringExtra("SAVED_ITEM_ID")

        setContent {
            val systemUiController = rememberSystemUiController()
            val useDarkIcons = !isSystemInDarkTheme()

            DisposableEffect(systemUiController, useDarkIcons) {
                systemUiController.setSystemBarsColor(
                    color = Color.Black,
                    darkIcons = false
                )

                onDispose {}
            }

            OmnivoreTheme {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        // .background(color = Color.Black)
                ) {
                    savedItemId?.let {
                        NotebookView(
                            savedItemId = savedItemId,
                            viewModel = viewModel
                        )
                    }
                }
                }
            }
        }

//        // animate the view up when keyboard appears
//        WindowCompat.setDecorFitsSystemWindows(window, false)
//        val rootView = findViewById<View>(android.R.id.content).rootView
//        ViewCompat.setOnApplyWindowInsetsListener(rootView) { _, insets ->
//            val imeHeight = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
//            rootView.setPadding(0, 0, 0, imeHeight)
//            insets
//        }
//    }

    private fun startMainActivity() {
        val intent = Intent(this, MainActivity::class.java)
        this.startActivity(intent)
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun NotebookView(savedItemId: String, viewModel: NotebookViewModel) {
    val onBackPressedDispatcher = LocalOnBackPressedDispatcherOwner.current?.onBackPressedDispatcher
    val savedItem = viewModel.getLibraryItemById(savedItemId).observeAsState()
    val scrollState = rememberScrollState()
    val modalBottomSheetState = rememberModalBottomSheetState(
        ModalBottomSheetValue.Hidden,
    )
    val notes = savedItem.value?.highlights?.filter { it.type == "NOTE" } ?: listOf()
    val highlights = savedItem.value?.highlights?.filter { it.type == "HIGHLIGHT" } ?: listOf()

    ModalBottomSheetLayout(
        modifier = Modifier.statusBarsPadding(),
        sheetBackgroundColor = Color.Transparent,
        sheetState = modalBottomSheetState,
        sheetContent = {
            EditNoteModal()
        }
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Notebook") },
                    modifier = Modifier.statusBarsPadding(),
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.background
                    ),
                    navigationIcon = {
                        IconButton(onClick = {
                            onBackPressedDispatcher?.onBackPressed()
                        }) {
                            Icon(
                                imageVector = androidx.compose.material.icons.Icons.Filled.ArrowBack,
                                modifier = Modifier,
                                contentDescription = "Back"
                            )
                        }
                    },
//                    actions = {
//                        IconButton(onClick = {
//
//                        }) {
//                            Icon(
//                                imageVector = Icons.Default.MoreVert,
//                                contentDescription = null
//                            )
//                        }
//                    }
                )
            }
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .padding(paddingValues)
                    .verticalScroll(scrollState)
                    .fillMaxSize()
            ) {
                savedItem.value?.let {
                    if (notes.isNotEmpty()) {
                        ArticleNotes(it)
                    }
                    HighlightsList(it)
                }
                Spacer(Modifier.weight(100f))
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun EditNoteModal() {
    val onBackPressedDispatcher = LocalOnBackPressedDispatcherOwner.current?.onBackPressedDispatcher
    val annotation = remember { mutableStateOf("") }

    BottomSheetUI() {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Note") },
                    modifier = Modifier.statusBarsPadding(),
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.background
                    ),
                    navigationIcon = {
                        IconButton(onClick = {
                            onBackPressedDispatcher?.onBackPressed()
                        }) {
                            Icon(
                                imageVector = androidx.compose.material.icons.Icons.Filled.ArrowBack,
                                modifier = Modifier,
                                contentDescription = "Back"
                            )
                        }
                    }
                )
            }
        ) { paddingValues ->
            TextField(
                modifier = Modifier
                    .padding(paddingValues)
                    .fillMaxSize(),
                value = annotation.value, onValueChange = { annotation.value = it }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun ArticleNotes(item: SavedItemWithLabelsAndHighlights) {
    val notes = item.highlights?.filter { it.type == "NOTE" } ?: listOf()
    val showDialog = remember { mutableStateOf(false) }
    val modalBottomSheetState = rememberModalBottomSheetState(
        ModalBottomSheetValue.Expanded,
    )
    val annotation = remember { mutableStateOf("") }

    Column(modifier = Modifier
        .fillMaxWidth()
        .padding(start = 15.dp)
    ) {
        Text("Article Notes")
        Divider(modifier = Modifier.padding(bottom= 15.dp))
        notes.forEach { note ->
            MarkdownText(
                markdown = note.annotation ?: "",
                fontSize = 14.sp,
                style = TextStyle(lineHeight = 18.sp),
                color = MaterialTheme.colorScheme.onPrimaryContainer,
            )
        }
        if (notes.isEmpty()) {
            Button(
                onClick = {
//                    viewModelScope.launch {
//                        datastoreRepo.clearValue(DatastoreKeys.omnivorePendingUserToken)
//                    }
                },
                modifier = Modifier
                    .padding(0.dp, end = 15.dp)
                    .fillMaxWidth(),
                shape = androidx.compose.material.MaterialTheme.shapes.medium,
                colors = ButtonDefaults.buttonColors(
                    contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
//                Text(
//                    text = "Add Notes...",
//                    style = androidx.compose.material.MaterialTheme.typography.subtitle2,
//                    modifier = Modifier
//                        .padding(vertical = 2.dp, horizontal = 0.dp),
//                )
                Spacer(Modifier.weight(1f))
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HighlightsList(item: SavedItemWithLabelsAndHighlights) {
    val highlights = item.highlights?.filter { it.type == "HIGHLIGHT" } ?: listOf()
    val yellowColor = colorResource(R.color.cta_yellow)

    val coroutineScope = rememberCoroutineScope()
    val snackBarHostState = remember { SnackbarHostState() }
    val clipboard: ClipboardManager? =
        LocalContext.current.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager?

    Column(modifier = Modifier
        .fillMaxWidth()
        .padding(start = 15.dp)
        .padding(top = 40.dp, bottom = 100.dp)
    ) {
        Text("Highlights")
        Divider(modifier = Modifier.padding(bottom= 10.dp))
        highlights.forEach { highlight ->
                var isMenuOpen by remember { mutableStateOf(false) }

                Row(modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.End)
                    .padding(0.dp)
                ) {
                    Spacer(Modifier.weight(1f))
                    Box {
                        IconButton(onClick = { isMenuOpen = true }) {
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = null
                            )
                        }
                        if (isMenuOpen) {
                            DropdownMenu(
                                expanded = isMenuOpen,
                                onDismissRequest = { isMenuOpen = false }
                            ) {
                                DropdownMenuItem(
                                    text = { Text("Copy") },
                                    onClick = {
                                        val clip = ClipData.newPlainText("highlight", highlight.quote)
                                        clipboard?.let {
                                            it
                                            clipboard?.setPrimaryClip(clip)
                                        } ?: run {
                                            coroutineScope.launch {
                                                snackBarHostState
                                                    .showSnackbar("Highlight copied")
                                            }
                                        }
                                        isMenuOpen = false
                                    }
                                )
                            }
                        }
                    }
                }

                highlight.quote?.let {
                    Row(modifier = Modifier
                        .padding(start = 2.dp, end = 15.dp)
                        .fillMaxWidth()
                        .drawWithCache {
                            onDrawWithContent {
                                // draw behind the content the vertical line on the left
                                drawLine(
                                    color = yellowColor,
                                    start = Offset.Zero,
                                    end = Offset(0f, this.size.height),
                                    strokeWidth = 10f
                                )

                                // draw the content
                                drawContent()
                            }
                        }) {

                        MarkdownText(
                            modifier = Modifier
                                .padding(start = 15.dp, end = 15.dp),
                            markdown = it,
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                        )
                    }
                }
                highlight.annotation?.let {
                    MarkdownText(
                        // modifier = Modifier.padding(paddingValues),
                        markdown = it,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                        )
                } ?: run {
//                    Surface(
//                        modifier = Modifier
//                            .padding(0.dp, end = 15.dp, top = 15.dp, bottom = 30.dp)
//                            .fillMaxWidth(),
//                        shape = androidx.compose.material.MaterialTheme.shapes.medium,
//                        color = MaterialTheme.colorScheme.surfaceVariant
//                    ) {
//                        Row {
//                            Text(
//                                text = "Add Notes...",
//                                style = androidx.compose.material.MaterialTheme.typography.subtitle2,
//                                modifier = Modifier.padding(vertical = 10.dp, horizontal = 10.dp)
//                            )
//                        }
//                    }
                }
        }
        if (highlights.isEmpty()) {
            Text(
                text = "You have not added any highlights to this page.",
                style = androidx.compose.material.MaterialTheme.typography.subtitle2,
                modifier = Modifier.padding(vertical = 10.dp, horizontal = 10.dp)
            )
        }
    }
}

@Composable
private fun BottomSheetUI(content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .wrapContentHeight()
            .fillMaxWidth()
            .clip(RoundedCornerShape(topEnd = 20.dp, topStart = 20.dp))
            .background(Color.White)
            .statusBarsPadding()
            .padding(top = 20.dp)
    ) {
        content()
    }
}

