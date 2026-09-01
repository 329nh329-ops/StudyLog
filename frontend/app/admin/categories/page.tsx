"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { createCategory, deleteCategory, listCategories, updateCategory } from "@/lib/category";
import type { Category } from "@/types/category";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
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
    let cancelled = false;

    getCurrentUser().then((user) => {
      if (cancelled) return;
      if (user === null) {
        router.push("/login");
        return;
      }
      if (user.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      setAuthorized(true);
      loadCategories();
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function loadCategories() {
    try {
      const data = await listCategories();
      setCategories(data);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "カテゴリ一覧の取得に失敗しました。");
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
      setCreateError(e instanceof ApiError ? e.message : "カテゴリの追加に失敗しました。");
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
      setEditError(e instanceof ApiError ? e.message : "カテゴリの更新に失敗しました。");
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
      setError(e instanceof ApiError ? e.message : "カテゴリの削除に失敗しました。");
    }
  }

  if (!authorized) {
    return null;
  }

  return (
    <main>
      <h1>カテゴリ管理</h1>

      {error && <p role="alert">{error}</p>}

      <form onSubmit={handleCreate}>
        <label htmlFor="new-category-name">カテゴリ名</label>
        <input
          id="new-category-name"
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" disabled={creating}>
          追加する
        </button>
        {createError && <p role="alert">{createError}</p>}
      </form>

      <table>
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
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                    {editError && <p role="alert">{editError}</p>}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(category.id)}
                      disabled={saving}
                    >
                      保存
                    </button>
                    <button type="button" onClick={cancelEdit}>
                      キャンセル
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{category.name}</td>
                  <td>
                    <button type="button" onClick={() => startEdit(category)}>
                      編集
                    </button>
                    <button type="button" onClick={() => handleDelete(category)}>
                      削除
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
