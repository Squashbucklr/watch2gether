{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }: (
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        venv = "./src/db/venv";
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodePackages.nodejs
            nodePackages.node-gyp-build
            nodePackages.sass
            python312
            python312Packages.distutils
          ];
        };
      }
    )
  );
}
