<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->decimal('original_price', 10, 2)->nullable()->after('price');
        });

        DB::table('products')
            ->whereNotNull('discount_percentage')
            ->where('discount_percentage', '>', 0)
            ->orderBy('id')
            ->each(function (object $product): void {
                DB::table('products')
                    ->where('id', $product->id)
                    ->update([
                        'original_price' => round(
                            (float) $product->price * (100 / (100 - (int) $product->discount_percentage)),
                            2,
                        ),
                    ]);
            });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn('original_price');
        });
    }
};
