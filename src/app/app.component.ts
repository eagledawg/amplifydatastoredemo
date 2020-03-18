import { Component, OnInit  } from '@angular/core';

import * as _ from 'lodash';
import { Todo } from '../models';
import { DataStore, Predicates } from "@aws-amplify/datastore";

//import { from } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

//export class AppComponent {
//  title = 'amplifyDataStoreDemo';
//}

export class AppComponent implements OnInit {
  usernameAttributes = "email"; 
  title = 'Amplify DataStore Offline Sync Demo';
  //data = from(DataStore.query(Todo, Predicates.ALL));
  
  todos:any[] = [];
  newTodo:string;
  editTodo:string;
  
  editId:string = "";
  
  ngOnInit(){

    this.loadTodos();
    
    this.subscription();

  }
  
  async loadTodos(){
    let todos = await DataStore.query<Todo>(Todo);
    let newTodos = _.map(todos, item => {
      return {
        id: item.id,
        name: item.name
      };
    });
    
    this.todos = newTodos;
  }
  
  async addTodo() {
    const newTask = await DataStore.save(new Todo({
      name: this.newTodo
    }))
    
    const created = newTask[0]
    
    this.todos.push({
      id: created.id,
      name: created.name
    });
    this.newTodo = "";
  }
  
  async updateTodo(updateId,updateName){
    // update local ref
    let todo = _.find(this.todos,todo => todo.id === updateId);
    todo.name = updateName;
    
    // update datastore
    const original = await DataStore.query<Todo>(Todo,updateId);
    await DataStore.save(
      Todo.copyOf(original, updated => {
        updated.name = updateName;
      })
    )
    
    // leave edit mode
    this.editId = "";
  }
  
  async delete(deleteTodo){
    // remote local ref
   _.remove(this.todos,todo => todo.id === deleteTodo.id);
    
    // remove from datastore
    const toDelete = await DataStore.query<Todo>(Todo, deleteTodo.id);
    DataStore.delete(toDelete);
  }
  
  edit(task:Todo){
    this.editId = task.id;
    this.editTodo = task.name;
  }

  //list() {
  //  this.data = from(DataStore.query(Todo, Predicates.ALL));
  //}

  subscription() {
    DataStore.observe<Todo>(Todo).subscribe(msg => {
  //    this.list();
      console.log(msg);
      this.loadTodos();
    });
  }

}