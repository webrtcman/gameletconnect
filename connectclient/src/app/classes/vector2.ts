export class Vector2 {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public toString(): string {
        return `${this.x} : ${this.y}`;
    }

    public toMediaConstraint() {
        return {
            width: {
                min: this.x,
                ideal: this.x
            },
            height: {
                min: this.y,
                ideal: this.y
            }
        }
    }
}