import {Component, Input} from '@angular/core';
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input() categories: CategoryWithTypeType[] = []
}
