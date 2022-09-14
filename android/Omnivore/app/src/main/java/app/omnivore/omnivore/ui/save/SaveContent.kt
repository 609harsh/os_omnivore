package app.omnivore.omnivore.ui.save

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.material.*
import androidx.compose.material.ButtonDefaults
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

@Composable
@OptIn(ExperimentalMaterialApi::class)
fun SaveContent(viewModel: SaveViewModel, modalBottomSheetState: ModalBottomSheetState, modifier: Modifier) {
  val coroutineScope = rememberCoroutineScope()

  Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colors.background) {
    Column(
      verticalArrangement = Arrangement.SpaceBetween,
      horizontalAlignment = Alignment.CenterHorizontally,
      modifier = Modifier
        .background(MaterialTheme.colors.background)
        .fillMaxSize()
        .padding(top = 48.dp, bottom = 32.dp)
    ) {
      Text(text = viewModel.message ?: "Saving")
      Button(onClick = {
        coroutineScope.launch {
            modalBottomSheetState.hide()
        }
      },
        colors = ButtonDefaults.buttonColors(
            contentColor = Color(0xFF3D3D3D),
            backgroundColor = Color(0xffffd234)
        )
      ) {
        Text(text = "Dismiss")
      }
    }
  }
}

