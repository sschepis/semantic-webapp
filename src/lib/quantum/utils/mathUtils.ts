import { Complex } from '../complex';

export function getPrimeFactors(n: number): number[] {
  if (n <= 1) return [1];
  const factors: number[] = [];
  let d = 2;
  let num = n;
  
  while (num > 1) {
    while (num % d === 0) {
      factors.push(d);
      num = Math.floor(num / d);
    }
    d++;
    if (d * d > num) {
      if (num > 1) factors.push(num);
      break;
    }
  }
  return factors;
}

export function spectralFormFactor(p: number, q: number, tau: number): Complex {
  const phase = (Math.log(p) - Math.log(q)) * tau;
  return new Complex(
    Math.cos(phase) / (p * q),
    Math.sin(phase) / (p * q)
  );
}

export function berryPhase(primes: number[], x: number): number {
  return primes.reduce((phase, p) => phase + Math.log(p) * x, 0);
}
