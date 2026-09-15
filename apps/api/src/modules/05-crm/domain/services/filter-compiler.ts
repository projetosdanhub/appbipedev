export type FilterOperator = "equals" | "contains" | "in" | "gt" | "lt";

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface FilterGroup {
  logic: "and" | "or";
  conditions: (FilterCondition | FilterGroup)[];
}

export type FilterAst = FilterGroup;

export interface CompiledFilter {
  sql: string;
  params: unknown[];
}

const ALLOWED_FIELDS = new Set(["name", "email", "phone"]);

export class FilterCompiler {
  private paramCounter = 1;
  private params: unknown[] = [];

  constructor(private readonly initialParamIndex = 1) {
    this.paramCounter = initialParamIndex;
  }

  public compile(ast: FilterAst): CompiledFilter {
    this.params = [];
    
    // An empty AST or empty conditions returns a match-all clause
    if (!ast || !ast.conditions || ast.conditions.length === 0) {
      return { sql: "1=1", params: [] };
    }

    const sql = this.compileGroup(ast);
    return { sql, params: this.params };
  }

  private compileGroup(group: FilterGroup): string {
    if (!group.conditions || group.conditions.length === 0) {
      return "1=1";
    }

    const clauses = group.conditions.map((cond) => {
      if ("logic" in cond) {
        return `(${this.compileGroup(cond)})`;
      }
      return this.compileCondition(cond);
    });

    const operator = group.logic === "or" ? " OR " : " AND ";
    return clauses.join(operator);
  }

  private compileCondition(cond: FilterCondition): string {
    if (!ALLOWED_FIELDS.has(cond.field)) {
      throw new Error(`Invalid filter field: ${cond.field}`);
    }

    const field = `"${cond.field}"`; // safe because of ALLOWED_FIELDS check

    switch (cond.operator) {
      case "equals":
        this.params.push(cond.value);
        return `${field} = $${this.paramCounter++}`;
      case "contains":
        this.params.push(`%${cond.value}%`);
        return `${field} ILIKE $${this.paramCounter++}`;
      case "in":
        if (!Array.isArray(cond.value) || cond.value.length === 0) {
          return "1=0"; // false
        }
        const placeholders = cond.value.map((val) => {
          this.params.push(val);
          return `$${this.paramCounter++}`;
        });
        return `${field} IN (${placeholders.join(", ")})`;
      default:
        throw new Error(`Unsupported operator: ${cond.operator}`);
    }
  }
}
