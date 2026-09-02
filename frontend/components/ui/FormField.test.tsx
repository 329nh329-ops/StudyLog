import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FormField from "./FormField";

describe("FormField", () => {
  it("labelとchildrenが表示される", () => {
    render(
      <FormField label="ユーザー名" htmlFor="username">
        <input id="username" />
      </FormField>,
    );
    expect(screen.getByLabelText("ユーザー名")).toBeInTheDocument();
  });

  it("errorがある場合はエラーメッセージが表示される", () => {
    render(
      <FormField label="ユーザー名" htmlFor="username" error="必須です">
        <input id="username" />
      </FormField>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("必須です");
  });

  it("errorがない場合はエラーメッセージが表示されない", () => {
    render(
      <FormField label="ユーザー名" htmlFor="username">
        <input id="username" />
      </FormField>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
