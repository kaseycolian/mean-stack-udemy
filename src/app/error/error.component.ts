import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  // not adding it through a selector or used as component in router, so
  templateUrl: './errror.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {message: string}) {}
}
