<?php

$file = __DIR__.'/../vendor/pestphp/pest/src/TestSuite.php';

if (! file_exists($file)) {
    return;
}

$contents = file_get_contents($file);

if ($contents === false) {
    fwrite(STDERR, "Unable to read Pest TestSuite.php.\n");
    exit(1);
}

$original = '$this->rootPath = (string) realpath($rootPath);';
$patched = '$this->rootPath = (string) (realpath($rootPath) ?: $rootPath);';

if (str_contains($contents, $patched)) {
    return;
}

if (! str_contains($contents, $original)) {
    fwrite(STDERR, "Pest TestSuite.php did not contain the expected rootPath line.\n");
    exit(1);
}

file_put_contents($file, str_replace($original, $patched, $contents));
