package app.omnivore.omnivore.core.data

import app.omnivore.omnivore.core.model.ServerSyncStatus
import app.omnivore.omnivore.core.network.ReadingProgressParams
import app.omnivore.omnivore.core.network.updateReadingProgress
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

suspend fun DataService.updateWebReadingProgress(jsonString: String) {
    val readingProgressParams = Gson().fromJson(jsonString, ReadingProgressParams::class.java)
    val savedItemId = readingProgressParams.id ?: return

    withContext(Dispatchers.IO) {
        val savedItem = db.savedItemDao().findById(savedItemId) ?: return@withContext
        savedItem.readingProgress = readingProgressParams.readingProgressPercent ?: 0.0
        savedItem.readingProgressAnchor = readingProgressParams.readingProgressAnchorIndex ?: 0
        savedItem.serverSyncStatus = ServerSyncStatus.NEEDS_UPDATE.rawValue
        db.savedItemDao().update(savedItem)

        val isUpdatedOnServer = networker.updateReadingProgress(readingProgressParams)

        if (isUpdatedOnServer) {
            savedItem.serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue
            db.savedItemDao().update(savedItem)
        }
    }
}
