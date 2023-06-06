package app.omnivore.omnivore.ui.notebook

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
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
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.omnivore.omnivore.R
import app.omnivore.omnivore.persistence.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.ui.library.*
import dev.jeziellago.compose.markdowntext.MarkdownText
import kotlinx.coroutines.launch
import app.omnivore.omnivore.persistence.entities.Highlight
import app.omnivore.omnivore.ui.theme.OmnivoreTheme


fun notebookMD(notes: List<Highlight>, highlights: List<Highlight>): String {
    var result = ""

    if (notes.isNotEmpty()) {
        result += "## Notes\n"
        notes.forEach {
            result += it.annotation + "\n"
        }
        result += "\n"
    }

    if (highlights.isNotEmpty()) {
        result += "## Highlights\n"
        highlights.forEach {
            result += "> ${it.quote}\n"
            if ((it.annotation?: "").isNotEmpty()) {
                result += it.annotation + "\n"
            }
        }
        result += "\n"
    }

    return result
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun NotebookView(savedItemId: String, viewModel: NotebookViewModel, onEditNote: (note: Highlight?) -> Unit) {
    var isMenuOpen by remember {
        mutableStateOf(false)
    }
    val savedItem = viewModel.getLibraryItemById(savedItemId).observeAsState()
    val scrollState = rememberScrollState()
    val coroutineScope = rememberCoroutineScope()
    val snackBarHostState = remember { SnackbarHostState() }
    val clipboard: ClipboardManager? =
        LocalContext.current.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager?

    val notes = savedItem.value?.highlights?.filter { it.type == "NOTE" } ?: listOf()
    val highlights = savedItem.value?.highlights?.filter { it.type == "HIGHLIGHT" } ?: listOf()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Notebook") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                ),
                actions = {
                    Box {
                        IconButton(onClick = {
                            isMenuOpen = true
                        }) {
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
                                        val clip = ClipData.newPlainText("notebook", notebookMD(notes, highlights))
                                        clipboard?.let {
                                            clipboard?.setPrimaryClip(clip)
                                        } ?: run {
                                            coroutineScope.launch {
                                                snackBarHostState
                                                    .showSnackbar("Notebook copied")
                                            }
                                        }
                                        isMenuOpen = false
                                    }
                                )
                            }
                        }
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .verticalScroll(scrollState)
                .fillMaxSize()
                .padding(top = paddingValues.calculateTopPadding())
        ) {
            savedItem.value?.let {
                ArticleNotes(viewModel, it, onEditNote)
                HighlightsList(it, onEditNote)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun EditNoteModal(initialValue: String?, onDismiss: (save: Boolean, text: String?) -> Unit) {
    val focusRequester = remember { FocusRequester() }
    val annotation = remember { mutableStateOf(initialValue ?: "") }

    BottomSheetUI() {
        Scaffold(
            topBar = {
                CenterAlignedTopAppBar(
                    title = { Text("Note") },
                    modifier = Modifier.statusBarsPadding(),
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.background
                    ),
                    navigationIcon = {
                        TextButton(onClick = {
                            onDismiss(false, initialValue)
                        }) {
                            Text(text = "Cancel")
                        }
                    },
                    actions = {
                        TextButton(onClick = {
                            onDismiss(true, annotation.value)
                        }) {
                            Text(text = "Save")
                        }
                    }
                )
            }
        ) { paddingValues ->
            TextField(
                modifier = Modifier
                    .padding(paddingValues)
                    .focusRequester(focusRequester)
                    .fillMaxSize(),
                value = annotation.value, onValueChange = { annotation.value = it },
                colors = TextFieldDefaults.textFieldColors(
                    textColor = Color.White
                )
            )
        }
    }

    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun ArticleNotes(viewModel: NotebookViewModel, item: SavedItemWithLabelsAndHighlights, onEditNote: (note: Highlight?) -> Unit) {
    val notes = item.highlights?.filter { it.type == "NOTE" } ?: listOf()

    Column(modifier = Modifier
        .fillMaxWidth()
        .padding(start = 15.dp)
        .padding(top = 20.dp, bottom = 50.dp)
    ) {
        Text("Article Notes")
        Divider(modifier = Modifier.padding(bottom= 15.dp))
        notes.forEach { note ->
            MarkdownText(
                markdown = note.annotation ?: "",
                fontSize = 14.sp,
                style = TextStyle(lineHeight = 18.sp),
                color = MaterialTheme.colorScheme.onPrimaryContainer,
                onClick = { onEditNote(note) }
            )
        }
        if (notes.isEmpty()) {
            Button(
                onClick = {
                    onEditNote(null)
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
                Text(
                    text = "Add Notes...",
                    style = androidx.compose.material.MaterialTheme.typography.subtitle2,
                    modifier = Modifier
                        .padding(vertical = 2.dp, horizontal = 0.dp),
                )
                Spacer(Modifier.weight(1f))
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HighlightsList(item: SavedItemWithLabelsAndHighlights, onEditNote: (note: Highlight?) -> Unit) {
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
                    onClick = { onEditNote(highlight) },
                    modifier = Modifier
                        .padding(top = 15.dp),
                    )
            } ?: run {
                Button(
                    onClick = {
                        onEditNote(highlight)
                    },
                    modifier = Modifier
                        .padding(0.dp, top = 15.dp, end = 15.dp)
                        .fillMaxWidth(),
                    shape = androidx.compose.material.MaterialTheme.shapes.medium,
                    colors = ButtonDefaults.buttonColors(
                        contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Text(
                        text = "Add Note...",
                        style = androidx.compose.material.MaterialTheme.typography.subtitle2,
                        modifier = Modifier
                            .padding(vertical = 2.dp, horizontal = 0.dp),
                    )
                    Spacer(Modifier.weight(1f))
                }
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

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun BottomSheetUI(content: @Composable () -> Unit) {
    OmnivoreTheme() {
        Box(
            modifier = Modifier
                .wrapContentHeight()
                .fillMaxWidth()
                .clip(RoundedCornerShape(topEnd = 20.dp, topStart = 20.dp))
                .background(Color.Transparent)
                .statusBarsPadding()
        ) {
            Scaffold(
            ) { paddingValues ->
                Box(modifier = Modifier.fillMaxSize()) {
                    content()
                }
            }
        }
    }
}

