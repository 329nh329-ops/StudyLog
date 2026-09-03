"use client";

import { useEffect, useState } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import PageHeader from "@/components/ui/PageHeader";
import { toErrorMessage } from "@/lib/api";
import { createCategory, deleteCategory, listCategories, updateCategory } from "@/lib/category";
import type { Category } from "@/types/category";
import styles from "./page.module.css";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await listCategories();
      setCategories(data);
      setError(null);
    } catch (e) {
      setError(toErrorMessage(e, "カテゴリ一覧の取得に失敗しました。"));
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      await createCategory({ name: newName });
      setNewName("");
      await loadCategories();
    } catch (e) {
      setCreateError(toErrorMessage(e, "カテゴリの追加に失敗しました。"));
    } finally {
      setCreating(false);
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
    setEditError(null);
  }

  async function handleSaveEdit(id: number) {
    setEditError(null);
    setSaving(true);
    try {
      await updateCategory(id, { name: editingName });
      setEditingId(null);
      setEditingName("");
      await loadCategories();
    } catch (e) {
      setEditError(toErrorMessage(e, "カテゴリの更新に失敗しました。"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`カテゴリ「${category.name}」を削除しますか？`)) {
      return;
    }
    try {
      await deleteCategory(category.id);
      await loadCategories();
    } catch (e) {
      setError(toErrorMessage(e, "カテゴリの削除に失敗しました。"));
    }
  }

  return (
    <div>
      <PageHeader title="カテゴリ管理" />

      {error && <ErrorMessage message={error} />}

      <Card className={styles.formCard}>
        <form onSubmit={handleCreate} className={styles.createForm}>
          <FormField label="カテゴリ名" htmlFor="new-category-name" error={createError ?? undefined}>
            <div className={styles.createField}>
              <input
                id="new-category-name"
                type="text"
                className={styles.input}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </FormField>
          <Button type="submit" disabled={creating}>
            追加する
          </Button>
        </form>
      </Card>

      <Card>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>カテゴリ名</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                {editingId === category.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        className={styles.editInput}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                      {editError && <ErrorMessage message={editError} />}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          type="button"
                          onClick={() => handleSaveEdit(category.id)}
                          disabled={saving}
                        >
                          保存
                        </Button>
                        <Button type="button" variant="secondary" onClick={cancelEdit}>
                          キャンセル
                        </Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{category.name}</td>
                    <td>
                      <div className={styles.actions}>
                        <Button type="button" variant="secondary" onClick={() => startEdit(category)}>
                          編集
                        </Button>
                        <Button type="button" variant="danger" onClick={() => handleDelete(category)}>
                          削除
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
