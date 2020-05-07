package migration1588853064

import (
	"github.com/jinzhu/gorm"
)

// Migrate makes the nonce column on txes unique per account
func Migrate(tx *gorm.DB) error {
	return tx.Exec(`
		WITH txes_to_delete AS (
			SELECT id
			FROM txes
			JOIN (SELECT nonce, "from" FROM txes GROUP BY nonce, "from" HAVING count(id) > 1) duplicate_txes_by_nonce
				ON duplicate_txes_by_nonce.nonce = txes.nonce AND duplicate_txes_by_nonce.from = txes.from
			AND txes.confirmed = false -- only one can possibly ever be confirmed
		)
		DELETE FROM txes WHERE id IN (SELECT id FROM txes_to_delete);
		DROP INDEX idx_txes_nonce;
	  	CREATE UNIQUE INDEX idx_txes_unique_nonces_per_account ON txes(nonce, "from");
	`).Error
}
