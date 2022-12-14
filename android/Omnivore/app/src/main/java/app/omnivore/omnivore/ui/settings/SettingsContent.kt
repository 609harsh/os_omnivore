import android.annotation.SuppressLint
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material3.*
import androidx.compose.material3.TopAppBarDefaults.smallTopAppBarColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.ui.auth.LoginViewModel
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import io.intercom.android.sdk.Intercom
import io.intercom.android.sdk.IntercomSpace

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun SettingsView(
  loginViewModel: LoginViewModel,
  navController: NavHostController,
) {
  Scaffold(
    topBar = {
      SmallTopAppBar(
        title = { Text("Settings") },
        colors = TopAppBarDefaults.smallTopAppBarColors(
          containerColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        actions = {
          IconButton(onClick = { navController.navigate(Routes.Home.route) }) {
            Icon(
              imageVector = Icons.Default.Home,
              contentDescription = null
            )
          }
        }
      )
    }
  ) {
    Column(
      verticalArrangement = Arrangement.Center,
      horizontalAlignment = Alignment.CenterHorizontally,
      modifier = Modifier
        .fillMaxSize()
        .navigationBarsPadding()
        .padding(horizontal = 16.dp)
    ) {
      LogoutButton { loginViewModel.logout() }
      Button(onClick = {
        Intercom.client().present(space = IntercomSpace.Messages)
      }) {
        Text(text = "Open Help Center")
      }
    }
  }
}

@Composable
fun LogoutButton(actionHandler: () -> Unit) {
  val context = LocalContext.current

  Button(onClick = {
    // Sign out google users
    val signInOptions = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
      .build()

    val googleSignIn = GoogleSignIn.getClient(context, signInOptions)
    googleSignIn.signOut()

    actionHandler()
  }) {
    Text(text = "Logout")
  }
}
