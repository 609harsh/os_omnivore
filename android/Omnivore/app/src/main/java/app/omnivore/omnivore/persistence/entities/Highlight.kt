package app.omnivore.omnivore.persistence.entities

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.LocalDate
import java.util.Date

@Entity
data class Highlight(
  @PrimaryKey val id: String,
  val annotation: String?,
  val createdAt: Date?,
  val createdByMe: Boolean,
  val markedForDeletion: Boolean, // default false
  val patch: String,
  val prefix: String?,
  val quote: String,
  val serverSyncStatus: Int, // default 0
  val shortId: String,
  val suffix: String?,
  val updatedAt: LocalDate?

  // has many SavedItemLabels (inverse: labels have many highlights)
  // has one savedItem (inverse: savedItem has many highlights
  // has a UserProfile (no inverse)
)
