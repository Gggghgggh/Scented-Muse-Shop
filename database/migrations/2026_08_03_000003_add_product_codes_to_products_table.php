<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('product_code')->nullable()->after('id');
        });

        DB::table('products')
            ->select(['id'])
            ->orderBy('id')
            ->each(function (object $product): void {
                DB::table('products')
                    ->where('id', $product->id)
                    ->update([
                        'product_code' => $this->codeForId((int) $product->id),
                    ]);
            });

        Schema::table('products', function (Blueprint $table) {
            $table->unique('product_code');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['product_code']);
            $table->dropColumn('product_code');
        });
    }

    private function codeForId(int $id): string
    {
        return 'SM-'.str_pad((string) (100000 + $id), 6, '0', STR_PAD_LEFT);
    }
};
