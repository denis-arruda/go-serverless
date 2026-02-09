import { ActivatedRoute, Router } from '@angular/router';
import { TodoDataService } from './../service/data/todo-data.service';
import { Component, OnInit } from '@angular/core';
import { Todo } from '../list-todos/list-todos.component';
import { AuthenticationService } from '../service/authentication.service';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {

  id: string;
  todo: Todo;

  constructor(
    private todoService: TodoDataService,
    private route: ActivatedRoute,
    private router: Router,
    private basicAuthenticationService: AuthenticationService
  ) {
  }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    console.log(this.id);
    this.todo = new Todo(this.id, this.basicAuthenticationService.getAuthenticatedUser(), '', false, new Date());
    if (this.id != "-1") {
      this.todoService.retrieveTodo(this.basicAuthenticationService.getAuthenticatedUser(), this.id)
        .subscribe(
          data => {
            console.log(data);
            // Support both DynamoDB and plain object responses
            const getValue = (field, type = 'S') => {
              if (field && typeof field === 'object' && field[type] !== undefined) return field[type];
              return field;
            };
            this.todo = new Todo(
              getValue(data.id),
              getValue(data.username),
              getValue(data.description),
              getValue(data.done, 'BOOL'),
              getValue(data.targetDate) ? new Date(getValue(data.targetDate)) : null
            );
          }
        );
    }
  }

  saveTodo() {
    if (this.id == "-1") {
      this.todoService.createTodo(this.basicAuthenticationService.getAuthenticatedUser(), this.todo)
        .subscribe(
          data => {
            console.log(data);
            this.router.navigate(['todos']);
          }
        );
    } else {
      this.todoService.updateTodo(this.basicAuthenticationService.getAuthenticatedUser(), this.id, this.todo)
        .subscribe(
          data => {
            console.log(data);
            this.router.navigate(['todos']);
          }
        );
    }
  }

}
