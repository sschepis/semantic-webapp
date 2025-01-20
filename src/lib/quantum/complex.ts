export class Complex {
  constructor(public real: number, public imag: number) {}

  static fromPolar(r: number, theta: number): Complex {
    return new Complex(
      r * Math.cos(theta),
      r * Math.sin(theta)
    );
  }

  add(other: Complex): Complex {
    return new Complex(
      this.real + other.real,
      this.imag + other.imag
    );
  }

  multiply(other: Complex): Complex {
    return new Complex(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    );
  }

  conjugate(): Complex {
    return new Complex(this.real, -this.imag);
  }

  scale(factor: number): Complex {
    return new Complex(
      this.real * factor,
      this.imag * factor
    );
  }

  magnitude(): number {
    return Math.sqrt(this.real * this.real + this.imag * this.imag);
  }

  phase(): number {
    return Math.atan2(this.imag, this.real);
  }
}
