export function isValid(param: any): boolean { return param !== undefined && param != null; }

export const regex = Object.freeze({
    NOT_NUMBERS: /[^0-9]/g
});

/// ColumnNumericTransformer
export class ColumnNumericTransformer {
    to(data: number): number {
        return data;
    }
    from(data: string): number {
        return parseFloat(data);
    }
}

export const NumericTransformer = new ColumnNumericTransformer();