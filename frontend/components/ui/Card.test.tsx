import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card", () => {
  it("childrenが表示される", () => {
    render(
      <Card>
        <p>カードの中身</p>
      </Card>,
    );
    expect(screen.getByText("カードの中身")).toBeInTheDocument();
  });
});
