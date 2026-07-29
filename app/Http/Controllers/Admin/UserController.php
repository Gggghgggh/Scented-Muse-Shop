<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where(function ($query) use ($search): void {
                        $query->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->latest()
                ->paginate(15, ['id', 'name', 'email', 'is_admin', 'created_at'])
                ->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'is_admin' => ['boolean'],
        ]);

        try {
            User::create([
                ...$data,
                'password' => Hash::make($data['password']),
                'is_admin' => (bool) ($data['is_admin'] ?? false),
            ]);
        } catch (Throwable $exception) {
            Log::error('User creation failed.', ['message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'User could not be created. Please try again.',
            ]);
        }

        return to_route('admin.users.index')->with('toast', [
            'type' => 'success',
            'message' => 'User created successfully.',
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', ['user' => $user]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user)],
            'password' => ['nullable', 'string', 'min:8'],
            'is_admin' => ['boolean'],
        ]);

        try {
            $user->update([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => filled($data['password'] ?? null) ? Hash::make($data['password']) : $user->password,
                'is_admin' => (bool) ($data['is_admin'] ?? false),
            ]);
        } catch (Throwable $exception) {
            Log::error('User update failed.', ['user_id' => $user->id, 'message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'User could not be saved. Please try again.',
            ]);
        }

        return to_route('admin.users.index')->with('toast', [
            'type' => 'success',
            'message' => 'User updated successfully.',
        ]);
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_if($user->is(auth()->user()), 422, 'You cannot delete your own account.');

        try {
            $user->delete();
        } catch (Throwable $exception) {
            Log::error('User deletion failed.', ['user_id' => $user->id, 'message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This user could not be deleted. Please try again.',
            ]);
        }

        return to_route('admin.users.index')->with('toast', [
            'type' => 'success',
            'message' => 'User deleted successfully.',
        ]);
    }
}
