<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_rates', function (Blueprint $table) {
            $table->id();
            $table->string('county');
            $table->string('town');
            $table->decimal('base_fee', 10, 2)->default(200);
            $table->decimal('fee_per_kg', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['county', 'town']);
        });

        $now = now();
        $rows = [];

        foreach (config('kenya-locations') as $county => $towns) {
            foreach ($towns as $town) {
                $rows[] = [
                    'county' => $county,
                    'town' => $town,
                    'base_fee' => 200,
                    'fee_per_kg' => 0,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::table('delivery_rates')->insert($rows);
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_rates');
    }
};
