import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'secure-task-system';
  private authService = inject(AuthService);

  ngOnInit() {
    // Initialize auth service after app starts to avoid circular dependency
    this.authService.loadUserFromStorage();
  }
}
