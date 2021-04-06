#include common_scripts\utility;

main()
{
	maps\mp\MAPNAME_fx::main();
	maps\createfx\MAPNAME_fx::main();
	maps\createart\MAPNAME_art::main();
	maps\mp\_load::main();

	game[ "attackers" ] = "allies";
	game[ "defenders" ] = "axis";

	ambientPlay ( "AMBIENT" );

	setdvar( "compassmaxrange", "2100" );
	maps\mp\_compass::setupMiniMap( "compass_map_MAPNAME" );
}
