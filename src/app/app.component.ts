import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {EditorModule} from 'primeng/editor';
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";

import { createClient } from '@supabase/supabase-js'

import * as uuid from 'uuid';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    EditorModule, ReactiveFormsModule, ButtonModule,
    InputTextModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  formGroup = new FormGroup({
    email: new FormControl(),
    subject: new FormControl(),
    primeNgEditor: new FormControl(),
  });

  editorTemplate : any;
  emailList : [] = [];

  supaBase = createClient('https://metaroxtujqnlvsksdjc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldGFyb3h0dWpxbmx2c2tzZGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MzY3MDksImV4cCI6MjAyNTQxMjcwOX0.1MosjazlOJE2FaoChtwjWvk2p6THB7Ziss2q-JXL6ps')
  async onSubmit() {
    const templateId = uuid.v4();
    const emailListString = this.formGroup.value.email.replace(/ /g, "");

    this.editorTemplate = this.formGroup.value.primeNgEditor;


    this.emailList = emailListString.split(',');

    console.log(this.formGroup.value.primeNgEditor);
    const data = await this.supaBase.from('email_template_demo')
      .insert({
        template: this.editorTemplate ,
        template_id: templateId,
        subject: this.formGroup.value.subject,
        email_list: this.emailList
      })
      .then(async response =>  {

        const {data} = await this.supaBase.functions.invoke('resend', {
          body: {templateId : templateId}
        });
      });

  }
}
