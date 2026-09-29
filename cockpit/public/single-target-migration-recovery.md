# Recovering from a failed blueprint migration

Use this guide only when the Image Builder error says a migration file operation failed and shows a backup path. That backup was copied before migration writes began and is retained after this failure. It contains only the original blueprint directories that the migration was splitting, not a copy of the entire blueprint store.

Do not retry the migration or use Image Builder until recovery is complete. Keep the backup directory unchanged.

## Restore the original blueprint directories

Use the backup path shown in the error. The blueprint directory is `$XDG_STATE_HOME/cockpit-image-builder`, or `$HOME/.local/state/cockpit-image-builder` when `XDG_STATE_HOME` is unset or empty. Use the same Cockpit account and administrator privileges needed to read and write those directories. If you use `sudo`, keep these paths set for the Cockpit account rather than switching to root's home directory.

First preserve the current blueprint directory, which may contain partial migration results:

```sh
BLUEPRINTS_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/cockpit-image-builder"
BACKUP_DIR='/path/shown/in/the/error'
FAILED_COPY="${BLUEPRINTS_DIR}.failed-migration-$(date +%s)"
cp -a -- "$BLUEPRINTS_DIR" "$FAILED_COPY"
```

Prefix `cp` with `sudo` if required to access the backup or blueprint directory.

Restore the backed-up directories over their original locations:

```sh
cp -a -- "$BACKUP_DIR"/. "$BLUEPRINTS_DIR"/
```

The interrupted migration may also have created new, UUID-named child blueprint directories that are not in the backup. Identify and remove only child directories created by this failed attempt. Their blueprint names are derived from the backed-up blueprint name and image target (for example, `Workstation - gcp`); compare their single image target with the original multi-target blueprint in the backup. Do not remove unrelated blueprint directories. If you cannot confidently identify all partial child directories, stop and contact your system administrator or Red Hat Support for help.

After restoring the originals and removing any partial child directories, reload Cockpit to retry the migration. Keep the backup until Image Builder opens successfully.
