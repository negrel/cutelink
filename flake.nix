{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { flake-utils, nixpkgs, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        lib = pkgs.lib;
      in {
        packages = {
          docker = pkgs.dockerTools.buildImage {
            name = "negrel/cutelink";
            tag = "dev";

            copyToRoot = [ pkgs.cacert ];
            runAsRoot = ''
              #!${pkgs.runtimeShell}
              mkdir -p /app
              cp -r ${./.}/* /app
            '';
            config = {
              Cmd = [ "${pkgs.deno}/bin/deno" "task" "start" ];
              WorkingDir = "/app";
            };
          };
        };
        devShells = {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [ deno bunyan-rs primesieve ];
          };
        };
      });
}

