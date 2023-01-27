package app.omnivore.omnivore.persistence.entities

import androidx.room.*

@Entity
data class SavedItemLabel(
  @PrimaryKey val savedItemLabelId: String,
  val name: String,
  val color: String,
  val createdAt: String?,
  val labelDescription: String?,
  val serverSyncStatus: Int = 0
)

@Dao
interface SavedItemLabelDao {
  @Insert(onConflict = OnConflictStrategy.REPLACE)
  fun insertAll(items: List<SavedItemLabel>)
}

@Entity(
  primaryKeys = ["savedItemLabelId", "savedItemId"],
  foreignKeys = [
    ForeignKey(
      entity = SavedItem::class,
      parentColumns = arrayOf("savedItemId"),
      childColumns = arrayOf("savedItemId"),
      onDelete = ForeignKey.CASCADE
    ),
    ForeignKey(
      entity = SavedItemLabel::class,
      parentColumns = arrayOf("savedItemLabelId"),
      childColumns = arrayOf("savedItemLabelId"),
      onDelete = ForeignKey.CASCADE
    )
  ]
)
data class SavedItemAndSavedItemLabelCrossRef(
  val savedItemLabelId: String,
  val savedItemId: String
)

data class SavedItemWithLabels(
  @Embedded val savedItem: SavedItem,
  @Relation(
    parentColumn = "savedItemId",
    entityColumn = "savedItemLabelId",
    associateBy = Junction(SavedItemAndSavedItemLabelCrossRef::class)
  )
  val labels: List<SavedItemLabel>
)

data class SavedItemCardDataWithLabels(
  @Embedded val cardData: SavedItemCardData,
  @Relation(
    parentColumn = "savedItemId",
    entityColumn = "savedItemLabelId",
    associateBy = Junction(SavedItemAndSavedItemLabelCrossRef::class)
  )
  val labels: List<SavedItemLabel>
)

@Dao
interface SavedItemAndSavedItemLabelCrossRefDao {
  @Insert(onConflict = OnConflictStrategy.REPLACE)
  fun insertAll(items: List<SavedItemAndSavedItemLabelCrossRef>)
}

// has many highlights
// has many savedItems
