import { Direction, Directionality } from '@angular/cdk/bidi';
import { EventEmitter, Injectable, OnDestroy, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppDirectionality implements Directionality, OnDestroy {
  readonly change = new EventEmitter<Direction>();

  get value(): Direction {
    return this.valueSignal();
  }
  set value(value: Direction) {
    this.valueSignal.set(value);
    this.change.next(value);
  }

  valueSignal = signal<Direction>('ltr');

  ngOnDestroy() {
    this.change.complete();
  }
}
