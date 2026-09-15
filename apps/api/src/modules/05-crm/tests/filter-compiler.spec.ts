import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FilterCompiler, FilterAst } from "../domain/services/filter-compiler.js";

describe("FilterCompiler", () => {
  it("should compile an empty filter to 1=1", () => {
    const compiler = new FilterCompiler();
    const ast: FilterAst = { logic: "and", conditions: [] };
    const { sql, params } = compiler.compile(ast);
    
    assert.equal(sql, "1=1");
    assert.deepEqual(params, []);
  });

  it("should compile a simple equals condition", () => {
    const compiler = new FilterCompiler();
    const ast: FilterAst = {
      logic: "and",
      conditions: [{ field: "name", operator: "equals", value: "John" }],
    };
    const { sql, params } = compiler.compile(ast);

    assert.equal(sql, '"name" = $1');
    assert.deepEqual(params, ["John"]);
  });

  it("should compile multiple conditions with AND", () => {
    const compiler = new FilterCompiler();
    const ast: FilterAst = {
      logic: "and",
      conditions: [
        { field: "name", operator: "equals", value: "John" },
        { field: "email", operator: "contains", value: "example.com" },
      ],
    };
    const { sql, params } = compiler.compile(ast);

    assert.equal(sql, '"name" = $1 AND "email" ILIKE $2');
    assert.deepEqual(params, ["John", "%example.com%"]);
  });

  it("should handle the initial parameter index correctly", () => {
    const compiler = new FilterCompiler(3); // Start at $3
    const ast: FilterAst = {
      logic: "and",
      conditions: [{ field: "name", operator: "equals", value: "John" }],
    };
    const { sql, params } = compiler.compile(ast);

    assert.equal(sql, '"name" = $3');
    assert.deepEqual(params, ["John"]);
  });

  it("should throw on invalid fields to prevent SQL injection", () => {
    const compiler = new FilterCompiler();
    const ast: FilterAst = {
      logic: "and",
      conditions: [{ field: "drop_table", operator: "equals", value: "yes" }],
    };
    
    assert.throws(() => compiler.compile(ast), /Invalid filter field: drop_table/);
  });

  it("should compile an IN condition", () => {
    const compiler = new FilterCompiler();
    const ast: FilterAst = {
      logic: "and",
      conditions: [{ field: "name", operator: "in", value: ["Alice", "Bob"] }],
    };
    const { sql, params } = compiler.compile(ast);

    assert.equal(sql, '"name" IN ($1, $2)');
    assert.deepEqual(params, ["Alice", "Bob"]);
  });

  it("should handle nested logic groups", () => {
    const compiler = new FilterCompiler();
    const ast: FilterAst = {
      logic: "or",
      conditions: [
        { field: "name", operator: "equals", value: "Alice" },
        {
          logic: "and",
          conditions: [
            { field: "email", operator: "equals", value: "bob@test.com" },
            { field: "phone", operator: "equals", value: "123" },
          ],
        },
      ],
    };
    const { sql, params } = compiler.compile(ast);

    assert.equal(sql, '"name" = $1 OR ("email" = $2 AND "phone" = $3)');
    assert.deepEqual(params, ["Alice", "bob@test.com", "123"]);
  });
});
