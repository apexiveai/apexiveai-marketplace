from django.db import migrations


def rename_legacy_user_table(apps, schema_editor):
    connection = schema_editor.connection

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT to_regclass(%s), to_regclass(%s)
            """,
            ["accounts_user", "users"],
        )
        legacy_table, current_table = cursor.fetchone()

    if legacy_table and not current_table:
        with connection.cursor() as cursor:
            cursor.execute(
                'ALTER TABLE "accounts_user" RENAME TO "users"'
            )


def reverse_rename(apps, schema_editor):
    connection = schema_editor.connection

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT to_regclass(%s), to_regclass(%s)
            """,
            ["accounts_user", "users"],
        )
        legacy_table, current_table = cursor.fetchone()

    if current_table and not legacy_table:
        with connection.cursor() as cursor:
            cursor.execute(
                'ALTER TABLE "users" RENAME TO "accounts_user"'
            )


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            rename_legacy_user_table,
            reverse_rename,
        ),
    ]
